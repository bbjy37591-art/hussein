import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTask,
  toggleTaskCompletion,
  toggleSubTaskCompletion,
  addSubTaskToTask,
  filterAndSortTasks,
  calculateDailyMetrics,
  deleteTaskById,
  rescheduleTaskDate,
  generateTaskAlerts,
  toggleHundredDayCompletion,
  addHundredDayHabit,
  calculateHundredDaysMetrics,
  INITIAL_TASKS,
  INITIAL_HUNDRED_DAYS_STATE,
  Task,
  HundredDaysState,
  TaskFilterState,
} from './taskLogic';

const SAMPLE_TASKS: Task[] = [
  createTask(
    {
      title: 'مراجعة خارطة طريق المنتج',
      priority: 'urgent',
      category: 'work',
      timeBlock: 'morning',
      scheduledTime: '08:30',
      dueDate: '2026-11-05',
      estimatedMinutes: 45,
      starred: true,
    },
    'task-101'
  ),
  {
    ...createTask(
      {
        title: 'تمرين صباحي',
        priority: 'medium',
        category: 'health',
        timeBlock: 'morning',
        scheduledTime: '07:15',
        dueDate: '2026-11-05',
        estimatedMinutes: 30,
      },
      'task-102'
    ),
    completed: true,
  },
];

test('initial state is formatted and completely empty', () => {
  assert.equal(INITIAL_TASKS.length, 0);
  assert.equal(INITIAL_HUNDRED_DAYS_STATE.habits.length, 0);
  assert.equal(INITIAL_HUNDRED_DAYS_STATE.completedDays.length, 0);
});

test('createTask validates title and applies defaults accurately', () => {
  assert.throws(() => createTask({ title: '   ' }), /عنوان المهمة مطلوب/);

  const task = createTask(
    {
      title: '  إعداد عرض المشروع  ',
      priority: 'urgent',
      category: 'work',
      timeBlock: 'morning',
      dueDate: '2026-11-10',
      estimatedMinutes: 50,
    },
    'test-id-1'
  );

  assert.equal(task.id, 'test-id-1');
  assert.equal(task.title, 'إعداد عرض المشروع');
  assert.equal(task.priority, 'urgent');
  assert.equal(task.category, 'work');
  assert.equal(task.timeBlock, 'morning');
  assert.equal(task.dueDate, '2026-11-10');
  assert.equal(task.estimatedMinutes, 50);
  assert.equal(task.completed, false);
});

test('toggleTaskCompletion flips completion state cleanly', () => {
  const sample = [
    createTask({ title: 'مهمة تجريبية أولى' }, 't-1'),
    createTask({ title: 'مهمة تجريبية ثانية' }, 't-2'),
  ];

  const afterToggle = toggleTaskCompletion(sample, 't-1');
  assert.equal(afterToggle[0].completed, true);
  assert.equal(afterToggle[1].completed, false);

  const afterSecondToggle = toggleTaskCompletion(afterToggle, 't-1');
  assert.equal(afterSecondToggle[0].completed, false);
});

test('rescheduleTaskDate updates dueDate for drag-and-drop calendar rescheduling', () => {
  const sample = [createTask({ title: 'مهمة تقويم', dueDate: '2026-11-05' }, 'cal-1')];
  const moved = rescheduleTaskDate(sample, 'cal-1', '2026-11-14');
  assert.equal(moved[0].dueDate, '2026-11-14');
});

test('generateTaskAlerts creates alerts for approaching tasks and active time blocks', () => {
  const alerts = generateTaskAlerts(SAMPLE_TASKS, '08:15', '2026-11-05');
  assert.equal(alerts.length > 0, true);
  assert.equal(alerts.some((a) => a.taskId === 'task-101'), true);
  assert.equal(alerts.some((a) => a.severity === 'timeblock'), true);
});

test('100-day challenge toggles days and computes streak and action metrics accurately', () => {
  let state: HundredDaysState = {
    habits: [
      { id: 'h-1', title: 'مهمة يومية 1', targetMinutes: 30 },
      { id: 'h-2', title: 'مهمة يومية 2', targetMinutes: 30 },
    ],
    completedDays: [1, 2, 3],
  };

  const initialMetrics = calculateHundredDaysMetrics(state);
  assert.equal(initialMetrics.completedDaysCount, 3);
  assert.equal(initialMetrics.remainingDaysCount, 97);
  assert.equal(initialMetrics.habitsCount, 2);
  assert.equal(initialMetrics.totalCompletedActions, 6);
  assert.equal(initialMetrics.currentStreak, 3);

  state = toggleHundredDayCompletion(state, 4);
  const nextMetrics = calculateHundredDaysMetrics(state);
  assert.equal(nextMetrics.completedDaysCount, 4);
  assert.equal(nextMetrics.currentStreak, 4);
  assert.equal(nextMetrics.totalCompletedActions, 8);

  const withExtraHabit = addHundredDayHabit(state, 'تدوين يومي 10 دقائق', 10);
  assert.equal(withExtraHabit.habits.length, 3);
});

test('addSubTaskToTask and toggleSubTaskCompletion manage subtasks accurately', () => {
  const base = [createTask({ title: 'مهمة رئيسية' }, 'main-1')];
  const withSub = addSubTaskToTask(base, 'main-1', 'خطوة فرعية 1', 'sub-100');
  assert.equal(withSub[0].subTasks.length, 1);
  assert.equal(withSub[0].subTasks[0].title, 'خطوة فرعية 1');
  assert.equal(withSub[0].subTasks[0].completed, false);

  const toggledSub = toggleSubTaskCompletion(withSub, 'main-1', 'sub-100');
  assert.equal(toggledSub[0].subTasks[0].completed, true);
});

test('filterAndSortTasks filters by status, category, search query, and sorts uncompleted first', () => {
  const defaultFilter: TaskFilterState = {
    searchQuery: '',
    status: 'all',
    category: 'all',
    timeBlock: 'all',
    priority: 'all',
    sortBy: 'priority',
  };

  const allSorted = filterAndSortTasks(SAMPLE_TASKS, defaultFilter);
  assert.equal(allSorted.length, 2);
  assert.equal(allSorted[0].completed, false);
  assert.equal(allSorted[1].completed, true);
});

test('calculateDailyMetrics computes counts, percentages, and minutes accurately', () => {
  const metrics = calculateDailyMetrics(SAMPLE_TASKS);
  assert.equal(metrics.totalCount, 2);
  assert.equal(metrics.completedCount, 1);
  assert.equal(metrics.pendingCount, 1);
  assert.equal(metrics.completionPercentage, 50);
  assert.equal(metrics.urgentPendingCount, 1);
  assert.equal(metrics.totalEstimatedMinutes, 75);
});

test('deleteTaskById removes the specified task', () => {
  const remaining = deleteTaskById(SAMPLE_TASKS, 'task-101');
  assert.equal(remaining.length, 1);
  assert.equal(remaining.some((t) => t.id === 'task-101'), false);
});

test('generateThirtyDayAnalytics computes 30-day completed vs overdue distribution and identifies peak productivity days', async () => {
  const { generateThirtyDayAnalytics } = await import('./taskLogic');
  const summary = generateThirtyDayAnalytics(SAMPLE_TASKS, true, '2026-11-05');
  assert.equal(summary.points.length, 30);
  assert.equal(summary.points[29].dateStr, '2026-11-05');
  assert.equal(summary.totalCompleted30d > summary.totalOverdue30d, true);
  assert.equal(summary.peakDays.length > 0, true);
  assert.equal(summary.topPeakDay.isPeakProductivity, true);
});

test('updateTaskIcon, updateChallengeConfig, and reorderHundredDayHabit customize icons and challenge parameters', async () => {
  const {
    updateTaskIcon,
    updateChallengeConfig,
    reorderHundredDayHabit,
  } = await import('./taskLogic');

  const updatedTasks = updateTaskIcon(SAMPLE_TASKS, 'task-101', 'laptop');
  assert.equal(updatedTasks[0].customIcon, 'laptop');

  let challengeState: HundredDaysState = {
    habits: [
      { id: 'h-1', title: 'هدف أول', targetMinutes: 20 },
      { id: 'h-2', title: 'هدف ثانٍ', targetMinutes: 40 },
    ],
    completedDays: [1, 5, 45],
    totalDays: 100,
    challengeTitle: 'تحدي البداية',
    goalDescription: 'وصف أولي',
    checkIcon: 'check',
  };

  challengeState = reorderHundredDayHabit(challengeState, 'h-2', 'up');
  assert.equal(challengeState.habits[0].id, 'h-2');
  assert.equal(challengeState.habits[1].id, 'h-1');

  challengeState = updateChallengeConfig(challengeState, {
    totalDays: 30,
    challengeTitle: 'تحدي 30 يوم للتركيز',
    goalDescription: 'إنجاز مشروع التخرج والرياضة اليومية',
    checkIcon: 'crown',
  });

  assert.equal(challengeState.totalDays, 30);
  assert.equal(challengeState.challengeTitle, 'تحدي 30 يوم للتركيز');
  assert.equal(challengeState.checkIcon, 'crown');
  // Day 45 is pruned when totalDays is reduced to 30
  assert.deepEqual(challengeState.completedDays, [1, 5]);

  const metrics30 = calculateHundredDaysMetrics(challengeState);
  assert.equal(metrics30.totalDays, 30);
  assert.equal(metrics30.remainingDaysCount, 28);

  const { verifyChallengePasscode, updateChallengeDayGoal } = await import(
    './taskLogic'
  );
  assert.equal(verifyChallengePasscode('1988'), true);
  assert.equal(verifyChallengePasscode(' 1988 '), true);
  assert.equal(verifyChallengePasscode('0000'), false);
  assert.equal(verifyChallengePasscode(''), false);

  challengeState = updateChallengeDayGoal(
    challengeState,
    1,
    'قراءة فصلين من كتاب هندسة البرمجيات'
  );
  assert.equal(
    challengeState.dayGoals?.[1],
    'قراءة فصلين من كتاب هندسة البرمجيات'
  );
  challengeState = updateChallengeDayGoal(challengeState, 1, '   ');
  assert.equal(challengeState.dayGoals?.[1], undefined);
});

test('applyTaskTemplate adds ready-made routine tasks with one click and multi-challenge helpers manage >4 separate challenges', async () => {
  const {
    applyTaskTemplate,
    getChallengesList,
    selectSeparateChallenge,
    addNewSeparateChallenge,
    deleteSeparateChallenge,
    INITIAL_HUNDRED_DAYS_STATE: defaultHundred,
  } = await import('./taskLogic');

  const afterMorning = applyTaskTemplate([], 'template-morning-routine', '2026-11-05');
  assert.equal(afterMorning.length, 3);
  assert.equal(afterMorning.every((t) => t.dueDate === '2026-11-05'), true);

  const afterFitness = applyTaskTemplate(
    afterMorning,
    'template-fitness-routine',
    '2026-11-05'
  );
  assert.equal(afterFitness.length, 6);

  const challenges = getChallengesList(defaultHundred);
  assert.equal(challenges.length >= 5, true);

  const switched = selectSeparateChallenge(defaultHundred, 'challenge-2');
  assert.equal(switched.activeChallengeId, 'challenge-2');
  assert.equal(switched.totalDays, 60);

  const withSixth = addNewSeparateChallenge(
    switched,
    'التحدي السادس: مشروع التخرج',
    45,
    'crown'
  );
  assert.equal(getChallengesList(withSixth).length, 6);
  assert.equal(withSixth.challengeTitle, 'التحدي السادس: مشروع التخرج');
  assert.equal(withSixth.totalDays, 45);

  const afterDelete = deleteSeparateChallenge(withSixth, withSixth.activeChallengeId!);
  assert.equal(getChallengesList(afterDelete).length, 5);
});

test('resolveChallengeDayGoal and shouldTriggerChallengeReminder support general vs custom_per_day goals and daily reminder hour', async () => {
  const {
    addNewSeparateChallenge,
    resolveChallengeDayGoal,
    shouldTriggerChallengeReminder,
    INITIAL_HUNDRED_DAYS_STATE: defaultHundred,
  } = await import('./taskLogic');

  const generalChallengeState = addNewSeparateChallenge(
    defaultHundred,
    'تحدي القراءة العام',
    30,
    'crown',
    {
      goalMode: 'general',
      generalGoal: 'قراءة 25 صفحة يومياً في جميع الأيام',
      reminderTime: '20:30',
      reminderEnabled: true,
    }
  );

  assert.equal(generalChallengeState.goalMode, 'general');
  assert.equal(
    resolveChallengeDayGoal(generalChallengeState, 1),
    'قراءة 25 صفحة يومياً في جميع الأيام'
  );
  assert.equal(
    resolveChallengeDayGoal(generalChallengeState, 15),
    'قراءة 25 صفحة يومياً في جميع الأيام'
  );

  const reminderMatch = shouldTriggerChallengeReminder(
    generalChallengeState,
    '20:30'
  );
  assert.equal(reminderMatch.shouldNotify, true);
  assert.equal(reminderMatch.nextDayNumber, 1);
  assert.equal(
    reminderMatch.message.includes('قراءة 25 صفحة يومياً في جميع الأيام'),
    true
  );

  const reminderMismatch = shouldTriggerChallengeReminder(
    generalChallengeState,
    '09:00'
  );
  assert.equal(reminderMismatch.shouldNotify, false);

  const customChallengeState = addNewSeparateChallenge(
    generalChallengeState,
    'تحدي خطة المشروع اليومية',
    14,
    'star',
    {
      goalMode: 'custom_per_day',
      dayGoals: {
        1: 'تصميم قاعدة البيانات',
        2: 'بناء واجهة المستخدم',
      },
      reminderTime: '18:00',
    }
  );

  assert.equal(customChallengeState.goalMode, 'custom_per_day');
  assert.equal(
    resolveChallengeDayGoal(customChallengeState, 1),
    'تصميم قاعدة البيانات'
  );
  assert.equal(
    resolveChallengeDayGoal(customChallengeState, 2),
    'بناء واجهة المستخدم'
  );
  assert.equal(resolveChallengeDayGoal(customChallengeState, 3), '');
});

test('createCustomCategory and calculateSevenDayMostProductive support custom categories with unique icon colors and 7-day productivity stats', async () => {
  const {
    createCustomCategory,
    calculateSevenDayMostProductive,
    createTask,
  } = await import('./taskLogic');

  const firstCat = createCustomCategory(
    [],
    'مشاريع هندسية خاصة',
    '#10B981',
    'rocket'
  );
  assert.equal(firstCat.categories.length, 1);
  assert.equal(firstCat.created.label, 'مشاريع هندسية خاصة');
  assert.equal(firstCat.created.iconColor, '#10B981');
  assert.equal(firstCat.created.icon, 'rocket');

  const customTask = createTask({
    title: 'تصميم مخطط معماري',
    customCategoryId: firstCat.created.id,
    customCategoryLabel: firstCat.created.label,
    customIconColor: firstCat.created.iconColor,
    customIcon: firstCat.created.icon,
    dueDate: '2026-11-03',
  });
  assert.equal(customTask.customCategoryLabel, 'مشاريع هندسية خاصة');
  assert.equal(customTask.customIconColor, '#10B981');

  const sevenDayTasks: Task[] = [
    {
      ...createTask({ title: 'مهمة 1', dueDate: '2026-11-02' }, 'w-1'),
      completed: true,
    },
    {
      ...createTask({ title: 'مهمة 2', dueDate: '2026-11-04' }, 'w-2'),
      completed: true,
    },
    {
      ...createTask({ title: 'مهمة 3', dueDate: '2026-11-04' }, 'w-3'),
      completed: true,
    },
    {
      ...createTask({ title: 'مهمة 4', dueDate: '2026-11-04' }, 'w-4'),
      completed: true,
    },
    {
      ...createTask({ title: 'مهمة 5', dueDate: '2026-11-05' }, 'w-5'),
      completed: false,
    },
  ];

  const stats = calculateSevenDayMostProductive(sevenDayTasks, '2026-11-05');
  assert.equal(stats.days.length, 7);
  assert.equal(stats.totalCompleted7d, 4);
  assert.equal(stats.hasLiveTasks, true);
  assert.equal(stats.mostProductiveDay.dateStr, '2026-11-04');
  assert.equal(stats.mostProductiveDay.completedCount, 3);
  assert.equal(stats.mostProductiveDay.dayNameAr, 'الأربعاء');
});

test('shouldTriggerChallengeReminder uses custom motivationalMessage when set instead of default alert', async () => {
  const {
    addNewSeparateChallenge,
    updateChallengeConfig,
    shouldTriggerChallengeReminder,
    INITIAL_HUNDRED_DAYS_STATE: defaultHundred,
  } = await import('./taskLogic');

  const stateWithCustomMotivation = addNewSeparateChallenge(
    defaultHundred,
    'تحدي الإتقان الهندسي',
    50,
    'crown',
    {
      goalMode: 'general',
      generalGoal: 'ساعتان تركيز عميق',
      reminderTime: '19:45',
      reminderEnabled: true,
      motivationalMessage: 'يا مهندس حسين، كل خطوة اليوم تقربك من القمة!',
    }
  );

  const triggered = shouldTriggerChallengeReminder(stateWithCustomMotivation, '19:45');
  assert.equal(triggered.shouldNotify, true);
  assert.equal(
    triggered.motivationalMessage,
    'يا مهندس حسين، كل خطوة اليوم تقربك من القمة!'
  );
  assert.equal(
    triggered.message.startsWith('يا مهندس حسين، كل خطوة اليوم تقربك من القمة!'),
    true
  );

  const updatedMotivationState = updateChallengeConfig(stateWithCustomMotivation, {
    motivationalMessage: 'الاستمرارية تصنع المعجزات، أنجز يومك الآن!',
  });

  const triggeredUpdated = shouldTriggerChallengeReminder(
    updatedMotivationState,
    '19:45'
  );
  assert.equal(
    triggeredUpdated.motivationalMessage,
    'الاستمرارية تصنع المعجزات، أنجز يومك الآن!'
  );
  assert.equal(
    triggeredUpdated.message.includes('الاستمرارية تصنع المعجزات، أنجز يومك الآن!'),
    true
  );
});

test('formatCountdownMMSS, getNextDayIsoDate, and carryOverRemainingWorkToNextDay support task countdown and next-day carryover', async () => {
  const {
    formatCountdownMMSS,
    getNextDayIsoDate,
    carryOverRemainingWorkToNextDay,
    createTask,
  } = await import('./taskLogic');

  assert.equal(formatCountdownMMSS(1800), '30:00');
  assert.equal(formatCountdownMMSS(65), '01:05');
  assert.equal(formatCountdownMMSS(0), '00:00');
  assert.equal(getNextDayIsoDate('2026-11-05'), '2026-11-06');

  const source = createTask(
    {
      title: 'مراجعة مخططات الأساسات',
      dueDate: '2026-11-05',
      estimatedMinutes: 45,
      priority: 'urgent',
    },
    'src-1'
  );

  const result = carryOverRemainingWorkToNextDay(
    [source],
    'src-1',
    'تبقى تدقيق تسليح القواعد الشرقية',
    'carry-1'
  );

  assert.equal(result.nextDayDate, '2026-11-06');
  assert.equal(result.tasks.length, 2);
  assert.equal(result.tasks[0].completed, true);
  assert.equal(result.tasks[0].notes, 'تبقى تدقيق تسليح القواعد الشرقية');
  assert.equal(result.createdTask?.id, 'carry-1');
  assert.equal(result.createdTask?.dueDate, '2026-11-06');
  assert.equal(result.createdTask?.completed, false);
  assert.equal(
    result.createdTask?.title.includes('تبقى تدقيق تسليح القواعد الشرقية'),
    true
  );
});

test('getPsychologyMotivationalInsight and partitionTasksByCompletion rotate psychology articles and separate completed tasks to bottom section', async () => {
  const {
    PSYCHOLOGY_MOTIVATIONAL_INSIGHTS,
    getPsychologyMotivationalInsight,
    partitionTasksByCompletion,
    shouldTriggerChallengeReminder,
    addNewSeparateChallenge,
    INITIAL_HUNDRED_DAYS_STATE: defaultHundred,
    createTask,
  } = await import('./taskLogic');

  assert.equal(PSYCHOLOGY_MOTIVATIONAL_INSIGHTS.length >= 8, true);

  const firstInsight = getPsychologyMotivationalInsight(0);
  const secondInsight = getPsychologyMotivationalInsight(1);
  assert.notEqual(firstInsight.id, secondInsight.id);
  assert.equal(firstInsight.principleAr.length > 0, true);
  assert.equal(firstInsight.scientistOrSource.length > 0, true);
  assert.equal(firstInsight.message.length > 0, true);

  // Wrapping around index
  const wrappedInsight = getPsychologyMotivationalInsight(PSYCHOLOGY_MOTIVATIONAL_INSIGHTS.length);
  assert.equal(wrappedInsight.id, firstInsight.id);

  // Automatic psychology insight fallback when motivationalMessage is empty
  const autoPsychChallenge = addNewSeparateChallenge(
    defaultHundred,
    'تحدي علم النفس السلوكي',
    30,
    'crown',
    {
      goalMode: 'general',
      generalGoal: 'تطبيق عادة يومية',
      reminderTime: '08:00',
      reminderEnabled: true,
      motivationalMessage: '',
    }
  );
  const reminderAuto = shouldTriggerChallengeReminder(autoPsychChallenge, '08:00');
  assert.equal(reminderAuto.shouldNotify, true);
  assert.equal(reminderAuto.motivationalMessage, firstInsight.message);

  // Partitioning active vs completed tasks
  const tasksList = [
    createTask({ title: 'مهمة نشطة 1' }, 'p-1'),
    { ...createTask({ title: 'مهمة مكتملة 1' }, 'p-2'), completed: true },
    createTask({ title: 'مهمة نشطة 2' }, 'p-3'),
    { ...createTask({ title: 'مهمة مكتملة 2' }, 'p-4'), completed: true },
  ];

  const partitioned = partitionTasksByCompletion(tasksList);
  assert.equal(partitioned.activeTasks.length, 2);
  assert.equal(partitioned.completedTasks.length, 2);
  assert.equal(partitioned.activeTasks.every((t) => !t.completed), true);
  assert.equal(partitioned.completedTasks.every((t) => t.completed), true);
});

test('per-challenge notification tones and buildDailyPsychologyQuote support distinct alert tones and daily external psychology quotes', async () => {
  const {
    CHALLENGE_NOTIFICATION_TONES,
    getChallengeNotificationToneOption,
    getChallengesList,
    addNewSeparateChallenge,
    updateChallengeConfig,
    shouldTriggerChallengeReminder,
    buildDailyPsychologyQuote,
    INITIAL_HUNDRED_DAYS_STATE: defaultHundred,
  } = await import('./taskLogic');

  assert.equal(CHALLENGE_NOTIFICATION_TONES.length >= 6, true);

  const defaultList = getChallengesList(defaultHundred);
  // Default separate challenges have distinct tones
  assert.equal(defaultList[0].reminderTone, 'royal-chime');
  assert.equal(defaultList[1].reminderTone, 'victory-fanfare');
  assert.equal(defaultList[2].reminderTone, 'emerald-pulse');

  const customToneChallenge = addNewSeparateChallenge(
    defaultHundred,
    'تحدي الذكاء الاصطناعي',
    40,
    'gem',
    {
      reminderTime: '17:30',
      reminderEnabled: true,
      reminderTone: 'digital-radar',
    }
  );
  assert.equal(customToneChallenge.reminderTone, 'digital-radar');

  const reminderCheck = shouldTriggerChallengeReminder(
    customToneChallenge,
    '17:30'
  );
  assert.equal(reminderCheck.shouldNotify, true);
  assert.equal(reminderCheck.reminderTone, 'digital-radar');

  const updatedToneState = updateChallengeConfig(customToneChallenge, {
    reminderTone: 'zen-bell',
  });
  assert.equal(updatedToneState.reminderTone, 'zen-bell');
  assert.equal(
    getChallengeNotificationToneOption(updatedToneState.reminderTone).id,
    'zen-bell'
  );

  // Daily Psychology Quote builder with external API payload
  const quoteDay1 = buildDailyPsychologyQuote('2026-11-06', 0, {
    quoteEn: 'Well begun is half done.',
    authorEn: 'Aristotle',
    sourceService: 'Quotable External API (api.quotable.io)',
  });
  assert.equal(quoteDay1.dateStr, '2026-11-06');
  assert.equal(quoteDay1.quoteEn, 'Well begun is half done.');
  assert.equal(quoteDay1.authorEn, 'Aristotle');
  assert.equal(
    quoteDay1.sourceService,
    'Quotable External API (api.quotable.io)'
  );
  assert.equal(quoteDay1.quoteAr.length > 0, true);
  assert.equal(quoteDay1.psychologyPrincipleAr.length > 0, true);

  const quoteNextOffset = buildDailyPsychologyQuote('2026-11-06', 1);
  assert.notEqual(quoteDay1.quoteAr, quoteNextOffset.quoteAr);
});

