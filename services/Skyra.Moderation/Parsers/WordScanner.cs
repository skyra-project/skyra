using System;
using System.Linq;
using System.Collections.Generic;

namespace Skyra.Moderation.Parsers
{
	public class WordScanner
	{
		public ScannerMatch Check(ReadOnlySpan<char> input, IEnumerable<string> words)
		{
			if (!words.Any()) return ScannerMatch.FromFailure();
			if (words.All(string.IsNullOrWhiteSpace)) return ScannerMatch.FromFailure();

			input = Sanatise(input);

			var stringified = input.ToString();

			var matchedWords = words.Where(word => word == stringified);
			if (matchedWords.Any()) return new ScannerMatch(matchedWords.ToArray());

			foreach (var word in words)
			{
				var inputIndex = 0;
				var wordIndex = 0;

				var matches = 0;

				var found = false;

				while (wordIndex < word.Length)
				{
					var currentInput = input[inputIndex];
					var currentWord = word[wordIndex];

					if (inputIndex > 1 && input[inputIndex - 1] == currentInput && currentInput != currentWord || currentInput == ' ' || !char.IsLetter(currentInput))
					{
						inputIndex++;
						continue;
					}

					if (currentInput == currentWord)
					{
						inputIndex++;
						wordIndex++;
						matches++;
						continue;
					} // they match, so we continue looking

					wordIndex++;
				}

				if (matches == word.Length)
				{
					return ScannerMatch.FromSuccess(word);
				}

				return ScannerMatch.FromFailure();

			}

			return default;

		}

		private ReadOnlySpan<char> Sanatise(ReadOnlySpan<char> input)
		{
			return input.ToString()
				.Replace("\n", "")
				.Replace("\r\n", "");
			// todo: confusables
		}
	}
}
