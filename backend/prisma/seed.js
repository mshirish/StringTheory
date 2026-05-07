import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding curriculum…');

  // ── BEGINNER TRACK ──────────────────────────────────────────────────────
  const beginner = await prisma.track.upsert({
    where: { slug: 'beginner' },
    update: {},
    create: { slug: 'beginner', title: 'Beginner', description: 'Start from zero and play your first songs.', orderIndex: 0 },
  });

  // Module 1 — Your first chords
  const mod1 = await prisma.module.create({
    data: { trackId: beginner.id, title: 'Your first chords', description: 'Learn Em, Am and your first song.', orderIndex: 0, xpReward: 100 },
  });

  // Lesson 1
  const l1 = await prisma.lesson.create({ data: { moduleId: mod1.id, title: 'How to hold a guitar and pick', orderIndex: 0, xpReward: 25, durationSeconds: 240 } });
  await prisma.activity.createMany({ data: [
    { lessonId: l1.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/hold-guitar.mp4', transcript: 'In this lesson we cover posture and pick grip.', chapterTimestamps: [0, 45, 120] } },
    { lessonId: l1.id, type: 'exercise', orderIndex: 1, xpReward: 10, content: { instructions: 'Hold the guitar in the correct position for 30 seconds. Focus on keeping your wrist relaxed.', durationSeconds: 30, micCheckRequired: false } },
    { lessonId: l1.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: 'Which part of your body should the guitar body rest on?', options: ['Left knee', 'Right knee', 'Both knees', 'Your lap'], correctIndex: 3, explanation: 'The guitar rests on your lap with the waist of the body sitting on your strumming-side leg.' }] } },
  ]});

  // Lesson 2
  const l2 = await prisma.lesson.create({ data: { moduleId: mod1.id, title: 'The E minor chord', orderIndex: 1, xpReward: 25, unlockRequires: l1.id, difficultyNote: 'Your very first chord!', durationSeconds: 300 } });
  await prisma.activity.createMany({ data: [
    { lessonId: l2.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/em-chord.mp4', transcript: 'E minor uses two fingers on frets 2 of strings 4 and 5.', chapterTimestamps: [0, 30, 90] } },
    { lessonId: l2.id, type: 'chord_practice', orderIndex: 1, xpReward: 10, content: { chordIds: ['Em'], holdDurationMs: 3000, repsRequired: 5, instructions: 'Form the E minor chord and hold it cleanly for 3 seconds. Repeat 5 times.' } },
    { lessonId: l2.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [
      { question: 'How many fingers does E minor require?', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: 'E minor uses your middle and ring fingers on the 4th and 5th strings at the 2nd fret.' },
      { question: 'Which strings ring open on E minor?', options: ['Only string 1', 'Strings 1, 2 and 3', 'Strings 1, 2, 3 and 6', 'All strings'], correctIndex: 2, explanation: 'Strings 1 (high e), 2 (B), 3 (G) and 6 (low E) all ring open on E minor.' },
    ] } },
  ]});

  // Lesson 3
  const l3 = await prisma.lesson.create({ data: { moduleId: mod1.id, title: 'The A minor chord', orderIndex: 2, xpReward: 25, unlockRequires: l2.id, durationSeconds: 300 } });
  await prisma.activity.createMany({ data: [
    { lessonId: l3.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/am-chord.mp4', transcript: 'A minor is a three-finger chord on strings 2, 3 and 4 at the 2nd fret.', chapterTimestamps: [0, 30, 90] } },
    { lessonId: l3.id, type: 'chord_practice', orderIndex: 1, xpReward: 10, content: { chordIds: ['Am'], holdDurationMs: 3000, repsRequired: 5, instructions: 'Form the A minor chord and hold it cleanly for 3 seconds. Repeat 5 times.' } },
    { lessonId: l3.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [
      { question: 'How many strings does A minor use?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'A minor uses strings 1–5; string 6 (low E) is muted.' },
      { question: 'Where do your fingers go for Am?', options: ['2nd fret of strings 2, 3, 4', '1st fret of strings 1, 2', '3rd fret of strings 4, 5, 6', '2nd fret of strings 1, 2, 3'], correctIndex: 0, explanation: 'Am places fingers at the 2nd fret of the D (4th), G (3rd) and B (2nd) strings.' },
    ] } },
  ]});

  // Lesson 4
  const l4 = await prisma.lesson.create({ data: { moduleId: mod1.id, title: 'Switching between Em and Am', orderIndex: 3, xpReward: 30, unlockRequires: l3.id, difficultyNote: 'Chord changes are the hardest part — be patient.', durationSeconds: 360 } });
  await prisma.activity.createMany({ data: [
    { lessonId: l4.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/em-am-switch.mp4', transcript: 'Smooth chord changes are the key to playing songs.', chapterTimestamps: [0, 40, 100] } },
    { lessonId: l4.id, type: 'exercise', orderIndex: 1, xpReward: 10, content: { instructions: 'Switch between Em and Am every 2 beats. Aim for 10 clean changes without stopping.', durationSeconds: 60, targetBpm: 60, micCheckRequired: false } },
    { lessonId: l4.id, type: 'chord_practice', orderIndex: 2, xpReward: 10, content: { chordIds: ['Em', 'Am'], holdDurationMs: 2000, repsRequired: 10, instructions: 'Alternate between Em and Am. Each counts as one rep.' } },
    { lessonId: l4.id, type: 'quiz', orderIndex: 3, xpReward: 5, content: { questions: [{ question: 'What is the best technique for faster chord changes?', options: ['Lift all fingers at once then place them', 'Keep fingers close to the strings while changing', 'Look at your fretting hand while changing', 'Change chords on the upstroke only'], correctIndex: 1, explanation: 'Keeping your fingers hovering just above the strings while changing reduces travel distance and builds speed.' }] } },
  ]});

  // Lesson 5
  const l5 = await prisma.lesson.create({ data: { moduleId: mod1.id, title: "Your first song: House of the Rising Sun", orderIndex: 4, xpReward: 50, unlockRequires: l4.id, difficultyNote: "Your first real song — you've earned this!", durationSeconds: 480 } });
  await prisma.activity.createMany({ data: [
    { lessonId: l5.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/house-rising-sun.mp4', transcript: 'House of the Rising Sun uses Em, Am, G and D.', chapterTimestamps: [0, 60, 180, 300] } },
    { lessonId: l5.id, type: 'exercise', orderIndex: 1, xpReward: 10, content: { instructions: 'Play the intro arpeggio pattern slowly with the backing track. Focus on clean notes not speed.', durationSeconds: 120, targetBpm: 60, micCheckRequired: false } },
    { lessonId: l5.id, type: 'chord_practice', orderIndex: 2, xpReward: 10, content: { chordIds: ['Em', 'Am', 'G', 'D'], holdDurationMs: 2000, repsRequired: 3, instructions: 'Cycle through all four song chords smoothly.' } },
    { lessonId: l5.id, type: 'quiz', orderIndex: 3, xpReward: 5, content: { questions: [{ question: 'What strumming style does House of the Rising Sun use?', options: ['Flat strumming', 'Arpeggio picking', 'Power chords', 'Fingerstyle'], correctIndex: 1, explanation: 'The song uses an arpeggio pattern — individual strings plucked in sequence rather than strummed.' }] } },
  ]});

  // Module 2 — Open chord family
  const mod2 = await prisma.module.create({
    data: { trackId: beginner.id, title: 'Open chord family', description: 'Master D, G and C and play your second song.', orderIndex: 1, xpReward: 150, unlockRequires: mod1.id },
  });

  const dL = await prisma.lesson.create({ data: { moduleId: mod2.id, title: 'The D chord', orderIndex: 0, xpReward: 25, durationSeconds: 300 } });
  await prisma.activity.createMany({ data: [
    { lessonId: dL.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/d-chord.mp4', transcript: 'D chord uses three fingers on strings 1, 2 and 3.', chapterTimestamps: [0, 30, 80] } },
    { lessonId: dL.id, type: 'chord_practice', orderIndex: 1, xpReward: 10, content: { chordIds: ['D'], holdDurationMs: 3000, repsRequired: 5, instructions: 'Hold a clean D chord for 3 seconds, 5 times.' } },
    { lessonId: dL.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: 'Which string is muted in D chord?', options: ['String 1', 'String 5', 'String 6', 'String 4'], correctIndex: 2, explanation: 'The low E string (6th) is not played in a standard open D chord.' }] } },
  ]});

  const gL = await prisma.lesson.create({ data: { moduleId: mod2.id, title: 'The G chord', orderIndex: 1, xpReward: 25, unlockRequires: dL.id, durationSeconds: 300 } });
  await prisma.activity.createMany({ data: [
    { lessonId: gL.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/g-chord.mp4', transcript: 'G chord spans the full fretboard with fingers on strings 1, 5 and 6.', chapterTimestamps: [0, 30, 80] } },
    { lessonId: gL.id, type: 'chord_practice', orderIndex: 1, xpReward: 10, content: { chordIds: ['G'], holdDurationMs: 3000, repsRequired: 5, instructions: 'Form G chord and strum all 6 strings cleanly.' } },
    { lessonId: gL.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: 'How many fingers does a full G chord use?', options: ['2', '3', '4', '1'], correctIndex: 1, explanation: 'G major uses 3 fingers: one each on strings 6, 5 and 1.' }] } },
  ]});

  const cL = await prisma.lesson.create({ data: { moduleId: mod2.id, title: 'The C chord', orderIndex: 2, xpReward: 25, unlockRequires: gL.id, durationSeconds: 300 } });
  await prisma.activity.createMany({ data: [
    { lessonId: cL.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/c-chord.mp4', transcript: 'C chord is a cornerstone of pop and folk guitar.', chapterTimestamps: [0, 30, 80] } },
    { lessonId: cL.id, type: 'chord_practice', orderIndex: 1, xpReward: 10, content: { chordIds: ['C'], holdDurationMs: 3000, repsRequired: 5, instructions: 'Form C chord and check each string rings clearly.' } },
    { lessonId: cL.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: 'Which string is NOT played in an open C chord?', options: ['String 2', 'String 6', 'String 4', 'String 1'], correctIndex: 1, explanation: 'The low E (string 6) is usually muted or not strummed in an open C chord.' }] } },
  ]});

  const tct = await prisma.lesson.create({ data: { moduleId: mod2.id, title: 'The three-chord trick', orderIndex: 3, xpReward: 35, unlockRequires: cL.id, durationSeconds: 360 } });
  await prisma.activity.createMany({ data: [
    { lessonId: tct.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/three-chord-trick.mp4', transcript: 'G, C and D are the foundation of hundreds of songs.', chapterTimestamps: [0, 45, 120] } },
    { lessonId: tct.id, type: 'chord_practice', orderIndex: 1, xpReward: 10, content: { chordIds: ['G', 'C', 'D'], holdDurationMs: 2000, repsRequired: 6, instructions: 'Cycle G → C → D. Smooth changes, not speed.' } },
    { lessonId: tct.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: 'The three-chord trick uses which chords in the key of G?', options: ['G, Am, Em', 'G, C, D', 'C, F, G', 'D, A, E'], correctIndex: 1, explanation: 'G, C and D are the I, IV and V chords in G major — the three-chord foundation.' }] } },
  ]});

  const koh = await prisma.lesson.create({ data: { moduleId: mod2.id, title: "Knockin' on Heaven's Door", orderIndex: 4, xpReward: 50, unlockRequires: tct.id, durationSeconds: 480 } });
  await prisma.activity.createMany({ data: [
    { lessonId: koh.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: 'https://example.com/knockin-heavens-door.mp4', transcript: "Four chords, iconic melody, perfect beginner song.", chapterTimestamps: [0, 60, 180] } },
    { lessonId: koh.id, type: 'exercise', orderIndex: 1, xpReward: 10, content: { instructions: "Practice the G–D–Am–C progression at 70 BPM until the changes feel automatic.", durationSeconds: 120, targetBpm: 70, micCheckRequired: false } },
    { lessonId: koh.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: "What key is Knockin' on Heaven's Door in?", options: ['E minor', 'G major', 'A minor', 'D major'], correctIndex: 1, explanation: "The song is in G major and primarily uses G, D and Am chords." }] } },
  ]});

  // Module 3 — Basic strumming patterns
  const mod3 = await prisma.module.create({
    data: { trackId: beginner.id, title: 'Basic strumming patterns', description: 'Add rhythm and feel to your chord vocabulary.', orderIndex: 2, xpReward: 150, unlockRequires: mod2.id },
  });

  const strumLessons = [
    { title: 'Down strumming in 4/4', xpReward: 25, note: null },
    { title: 'Down-up patterns', xpReward: 25, note: null },
    { title: 'The folk strum pattern', xpReward: 25, note: null },
    { title: 'Muting and dynamics', xpReward: 30, note: 'Dynamics = expression.' },
    { title: 'Wonderwall', xpReward: 50, note: 'Your third song!' },
  ];

  let prevStrumId = null;
  for (const [i, s] of strumLessons.entries()) {
    const sl = await prisma.lesson.create({ data: { moduleId: mod3.id, title: s.title, orderIndex: i, xpReward: s.xpReward, unlockRequires: prevStrumId, difficultyNote: s.note, durationSeconds: 300 } });
    await prisma.activity.createMany({ data: [
      { lessonId: sl.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: `https://example.com/${s.title.toLowerCase().replace(/ /g, '-')}.mp4`, transcript: `${s.title} lesson content.`, chapterTimestamps: [0, 45, 120] } },
      { lessonId: sl.id, type: 'exercise', orderIndex: 1, xpReward: 10, content: { instructions: `Practice ${s.title.toLowerCase()} for one minute at a steady tempo.`, durationSeconds: 60, targetBpm: 80, micCheckRequired: false } },
      { lessonId: sl.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: `What is the primary focus of ${s.title}?`, options: ['Speed', 'Consistency and feel', 'Volume', 'Chord shapes'], correctIndex: 1, explanation: 'Consistency and feel are always more important than speed when learning strumming patterns.' }] } },
    ]});
    prevStrumId = sl.id;
  }

  // ── INTERMEDIATE TRACK ──────────────────────────────────────────────────
  const intermediate = await prisma.track.upsert({
    where: { slug: 'intermediate' },
    update: {},
    create: { slug: 'intermediate', title: 'Intermediate', description: 'Barre chords, scales and soloing basics.', orderIndex: 1 },
  });

  const intMod1 = await prisma.module.create({ data: { trackId: intermediate.id, title: 'Barre chords', orderIndex: 0, xpReward: 150 } });
  const intMod2 = await prisma.module.create({ data: { trackId: intermediate.id, title: 'Pentatonic scale', orderIndex: 1, xpReward: 150, unlockRequires: intMod1.id } });

  for (const [mod, lessons] of [
    [intMod1, ['F major barre', 'Bm barre chord', 'Moving barre shapes']],
    [intMod2, ['Minor pentatonic box 1', 'Pentatonic runs', 'Blues licks']],
  ]) {
    let prevId = null;
    for (const [i, title] of lessons.entries()) {
      const l = await prisma.lesson.create({ data: { moduleId: mod.id, title, orderIndex: i, xpReward: 30, unlockRequires: prevId, durationSeconds: 360 } });
      await prisma.activity.createMany({ data: [
        { lessonId: l.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: `https://example.com/${title.toLowerCase().replace(/ /g, '-')}.mp4`, transcript: `${title} — placeholder transcript.`, chapterTimestamps: [0, 60, 120] } },
        { lessonId: l.id, type: 'exercise', orderIndex: 1, xpReward: 10, content: { instructions: `Practice ${title} slowly, focusing on clean tone.`, durationSeconds: 90, targetBpm: 70, micCheckRequired: false } },
        { lessonId: l.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: `True or false: ${title} is worth practising daily.`, options: ['True', 'False'], correctIndex: 0, explanation: 'Daily practice of fundamentals accelerates progress significantly.' }] } },
      ]});
      prevId = l.id;
    }
  }

  // ── ADVANCED TRACK ──────────────────────────────────────────────────────
  const advanced = await prisma.track.upsert({
    where: { slug: 'advanced' },
    update: {},
    create: { slug: 'advanced', title: 'Advanced', description: 'Jazz chords, modes and advanced technique.', orderIndex: 2 },
  });

  const advMod1 = await prisma.module.create({ data: { trackId: advanced.id, title: 'Jazz chord voicings', orderIndex: 0, xpReward: 200 } });
  const advMod2 = await prisma.module.create({ data: { trackId: advanced.id, title: 'Modal improvisation', orderIndex: 1, xpReward: 200, unlockRequires: advMod1.id } });

  for (const [mod, lessons] of [
    [advMod1, ['Drop-2 voicings', 'ii-V-I progressions', 'Tritone substitution']],
    [advMod2, ['Dorian mode', 'Mixolydian mode', 'Lydian mode']],
  ]) {
    let prevId = null;
    for (const [i, title] of lessons.entries()) {
      const l = await prisma.lesson.create({ data: { moduleId: mod.id, title, orderIndex: i, xpReward: 40, unlockRequires: prevId, durationSeconds: 480 } });
      await prisma.activity.createMany({ data: [
        { lessonId: l.id, type: 'video', orderIndex: 0, xpReward: 10, content: { videoUrl: `https://example.com/${title.toLowerCase().replace(/ /g, '-')}.mp4`, transcript: `${title} — advanced placeholder.`, chapterTimestamps: [0, 90, 180] } },
        { lessonId: l.id, type: 'exercise', orderIndex: 1, xpReward: 15, content: { instructions: `Work through the ${title} exercise at your comfortable tempo.`, durationSeconds: 120, micCheckRequired: false } },
        { lessonId: l.id, type: 'quiz', orderIndex: 2, xpReward: 5, content: { questions: [{ question: `What is the characteristic of ${title}?`, options: ['Rhythm focus', 'Harmonic colour', 'Speed', 'Volume'], correctIndex: 1, explanation: 'Advanced guitar concepts predominantly deal with harmonic colour and voice leading.' }] } },
      ]});
      prevId = l.id;
    }
  }

  console.log('Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
