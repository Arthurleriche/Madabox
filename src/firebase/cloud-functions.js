import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export const startSession = httpsCallable(functions, 'startSession');
