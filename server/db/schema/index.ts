import {users} from "./users.ts";
import {answers} from "./answers.ts";
import {questions} from "./questions.ts";
import {submissions} from "./submissions.ts";
import {surveys} from "./surveys.ts";

export const schema = {users, surveys, questions, answers, submissions} as const;
