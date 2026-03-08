import { calculateNextRoutine } from '../src/app/dropset/utils/dropsetLogic';
import { DropsetRoutine } from '../src/types/types';

const mockRoutine: DropsetRoutine = {
  id: '1',
  routine_name: 'TEST',
  exercise: 'Bench Press',
  weight: 60,
  threshold_reps: 10,
  demotion_threshold: 5,
  consecutive_success: 0,
  consecutive_failure: 0
};

console.log('--- Test: Success Path ---');
let r = { ...mockRoutine };
let result = calculateNextRoutine(r, 10);
console.log('1st success:', result.updatedRoutine.consecutive_success === 1 ? 'OK' : 'FAIL');
result = calculateNextRoutine(result.updatedRoutine, 10);
console.log('2nd success (weight up):', result.updatedRoutine.weight === 62.5 ? 'OK' : 'FAIL');
console.log('Message:', result.message);

console.log('--- Test: Failure Path ---');
r = { ...mockRoutine };
result = calculateNextRoutine(r, 4);
console.log('1st failure:', result.updatedRoutine.consecutive_failure === 1 ? 'OK' : 'FAIL');
result = calculateNextRoutine(result.updatedRoutine, 4);
console.log('2nd failure (weight down):', result.updatedRoutine.weight === 57.5 ? 'OK' : 'FAIL');
console.log('Message:', result.message);

console.log('--- Test: Maintain Path ---');
r = { ...mockRoutine, consecutive_success: 1 };
result = calculateNextRoutine(r, 7);
console.log('Maintain (reset):', result.updatedRoutine.consecutive_success === 0 ? 'OK' : 'FAIL');
console.log('Weight unchanged:', result.updatedRoutine.weight === 60 ? 'OK' : 'FAIL');
