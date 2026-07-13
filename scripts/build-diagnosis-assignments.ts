import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadWards } from '../src/data/wards';
import { buildDiagnosisAssignments } from '../src/lib/diagnosisCalibration';
import { QUESTIONS } from '../src/lib/quiz';

const outputPath = resolve('src/data/diagnosis-assignments.json');
const snapshot = buildDiagnosisAssignments(QUESTIONS, loadWards());
await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`Generated ${outputPath} (${snapshot.assignments.length} answer patterns).`);
