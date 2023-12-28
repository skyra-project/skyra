import { fetch, FetchResultTypes } from '@sapphire/fetch';

export const enum TriviaResponseCode {
	Success,
	NoResults,
	InvalidParameter,
	TokenNotFound,
	TokenEmpty
}

export interface TriviaResultOk {
	response_code: TriviaResponseCode;
	results: QuestionData[];
}

/**
 * The question object returned by OpenTDB
 */
export interface QuestionData {
	category: string;
	type: QuestionType;
	difficulty: QuestionDifficulty;
	question: string;
	correct_answer: string;
	incorrect_answers: string[];
}

export const enum QuestionType {
	Boolean = 'boolean',
	Multiple = 'multiple'
}

export const enum QuestionDifficulty {
	Easy = 'easy',
	Medium = 'medium',
	Hard = 'hard'
}

export const CATEGORIES = {
	general: 9,
	books: 10,
	film: 11,
	music: 12,
	theatres: 13,
	tv: 14,
	videogames: 15,
	boardgames: 16,
	nature: 17,
	computers: 18,
	maths: 19,
	mythology: 20,
	sports: 21,
	geography: 22,
	history: 23,
	politics: 24,
	art: 25,
	celebrities: 26,
	animals: 27,
	vehicles: 28,
	comics: 29,
	gadgets: 30,
	manga: 31,
	cartoon: 32
};

export async function getQuestion(category: number, difficulty = QuestionDifficulty.Easy, questionType = QuestionType.Multiple) {
	const url = new URL('https://opentdb.com/api.php');
	url.searchParams.append('amount', '1');
	url.searchParams.append('category', category.toString());
	url.searchParams.append('difficulty', difficulty);
	url.searchParams.append('type', questionType);

	const data = await fetch<TriviaResultOk>(url, FetchResultTypes.JSON);
	const { response_code, results } = data;
	if (response_code === 0 && results.length) return results[0];
	throw new Error('Invalid request');
}
