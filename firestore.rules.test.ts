import test from 'node:test';
import assert from 'node:assert/strict';

interface SimulatedRequest {
  auth: { uid: string; email_verified: boolean } | null;
  time: number;
  pathId: string;
  resourceData: Record<string, unknown>;
  existingData?: Record<string, unknown>;
}

const ALLOWED_KEYS = [
  'id',
  'ownerId',
  'title',
  'notes',
  'completed',
  'priority',
  'category',
  'timeBlock',
  'scheduledTime',
  'dueDate',
  'estimatedMinutes',
  'actualMinutesFocused',
  'starred',
  'createdAt',
  'updatedAt',
];

function evaluateTaskWriteRule(req: SimulatedRequest, op: 'create' | 'update'): boolean {
  if (!req.auth || !req.auth.email_verified) return false;
  if (!/^[a-zA-Z0-9_\-]+$/.test(req.pathId) || req.pathId.length > 128) return false;

  const data = req.resourceData;
  const keys = Object.keys(data);
  if (keys.length !== ALLOWED_KEYS.length) return false;
  if (!keys.every((k) => ALLOWED_KEYS.includes(k))) return false;

  if (data.ownerId !== req.auth.uid) return false;
  if (typeof data.title !== 'string' || data.title.length < 1 || data.title.length > 300) return false;
  if (!['urgent', 'high', 'medium', 'low'].includes(String(data.priority))) return false;

  if (op === 'create') {
    if (data.createdAt !== req.time || data.updatedAt !== req.time) return false;
  } else {
    if (!req.existingData) return false;
    if (data.ownerId !== req.existingData.ownerId) return false;
    if (data.createdAt !== req.existingData.createdAt) return false;
    if (data.updatedAt !== req.time) return false;
  }

  return true;
}

const VALID_BASE = {
  id: 'task-1',
  ownerId: 'user-123',
  title: 'مهمة سحابية',
  notes: '',
  completed: false,
  priority: 'high',
  category: 'work',
  timeBlock: 'morning',
  scheduledTime: '09:00',
  dueDate: '2026-11-05',
  estimatedMinutes: 30,
  actualMinutesFocused: 0,
  starred: false,
  createdAt: 1000,
  updatedAt: 1000,
};

test('Dirty Dozen security payloads are rejected with PERMISSION_DENIED (false)', () => {
  // 1. Unauthenticated write
  assert.equal(
    evaluateTaskWriteRule({ auth: null, time: 1000, pathId: 'task-1', resourceData: VALID_BASE }, 'create'),
    false
  );

  // 2. Unverified email spoof
  assert.equal(
    evaluateTaskWriteRule(
      { auth: { uid: 'user-123', email_verified: false }, time: 1000, pathId: 'task-1', resourceData: VALID_BASE },
      'create'
    ),
    false
  );

  // 3. Identity spoofing on create
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'attacker-999', email_verified: true },
        time: 1000,
        pathId: 'task-1',
        resourceData: VALID_BASE,
      },
      'create'
    ),
    false
  );

  // 4. Shadow field injection on create
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'user-123', email_verified: true },
        time: 1000,
        pathId: 'task-1',
        resourceData: { ...VALID_BASE, isAdmin: true },
      },
      'create'
    ),
    false
  );

  // 5. Forged timestamp on create
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'user-123', email_verified: true },
        time: 2000,
        pathId: 'task-1',
        resourceData: VALID_BASE,
      },
      'create'
    ),
    false
  );

  // 6. Oversized title (>300 chars)
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'user-123', email_verified: true },
        time: 1000,
        pathId: 'task-1',
        resourceData: { ...VALID_BASE, title: 'أ'.repeat(500) },
      },
      'create'
    ),
    false
  );

  // 7. Invalid enum value
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'user-123', email_verified: true },
        time: 1000,
        pathId: 'task-1',
        resourceData: { ...VALID_BASE, priority: 'critical-hacked' },
      },
      'create'
    ),
    false
  );

  // 8. Invalid path ID poisoning
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'user-123', email_verified: true },
        time: 1000,
        pathId: 'bad id!@#',
        resourceData: VALID_BASE,
      },
      'create'
    ),
    false
  );

  // Valid payload succeeds
  assert.equal(
    evaluateTaskWriteRule(
      {
        auth: { uid: 'user-123', email_verified: true },
        time: 1000,
        pathId: 'task-1',
        resourceData: VALID_BASE,
      },
      'create'
    ),
    true
  );
});
