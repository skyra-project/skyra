using System;
using System.Linq;
using Skyra.Moderation.Parsers;
using NUnit.Framework;

namespace Skyra.UnitTests.Moderation.Filters
{
	public class WordScannerTests
	{
		[Test]
		public void WordScanner_ShouldReturnFalse_WhenGivenEmptyArrayOrEmptyStrings()
		{
			var scanner = new WordScanner();

			var result = scanner.Check("Hello There", Array.Empty<string>());

			Assert.IsFalse(result.HasMatched);
		}

		[Test]
		public void WordScanner_ShouldReturnFalse_WhenGivenEmptyContent()
		{
			var scanner = new WordScanner();

			var result = scanner.Check("Hello There", Enumerable.Repeat("", 10));

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("smeghead")]
		[TestCase("hellothere")]
		public void WordScanner_ShouldReturnTrue_WhenGivenAMatchingWord(string input)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, new string[] {input});

			Assert.IsTrue(result.HasMatched);
			Assert.IsTrue(result.Matches.Contains(input));
		}

		[TestCase("smeghead", "")]
		[TestCase("smeghead", "rimmer")]
		[TestCase("hello there", "general kenobi")]
		public void WordScanner_ShouldReturnFalse_WhenGivenANonMatchingWord(string wordToMatch, string input)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(wordToMatch, new string[] {input});

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("smeghead", new string[] {"hellothere", "smeghead"})]
		[TestCase("hello there", new string[] {"", "potato", "hello there", "good day"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWord(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
			Assert.IsTrue(words.Any(word => result.Matches.Contains(word)));
		}

		[TestCase("smeghead", new string[] {"hellothere", "rimmer"})]
		[TestCase("generalkenobi", new string[] {"hellothere", "rimmer"})]
		public void WordScanner_ShouldReturnFalse_WhenGivenAtLeastOneMatchingWord(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("smeegghead", new string[] {"smeghead"})]
		[TestCase("kenoooooooooobi", new string[] {"kenobi"})]
		[TestCase("kyyrraa", new string[] {"kyra"})]
		[TestCase("teeeeeesttttttingteeeessttttt", new string[] {"testingtest"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithRepeatingCharacters(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("egggg", new string[] {"egg"})]
		[TestCase("sappppppphire", new string[] {"sapphire"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithRepeatingCharactersInBothSides(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("smeg head", new string[] {"smeghead"})]
		[TestCase("general\nkenobi", new string[] {"generalkenobi"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithSpacesOrNewLines(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("smeg.head", new string[] {"smeghead"})]
		[TestCase("general-kenobi", new string[] {"generalkenobi"})]
		[TestCase("t.e.s.t", new string[] {"test"})]
		[TestCase("(t){e}[s]<t>", new string[] {"test"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithArtifacts(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("<t> (e)st", new string[] {"test"})]
		[TestCase("t[e]\nst", new string[] {"test"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithArtifactsAndSpacesOrNewLines(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("<tt> (eeee)stt", new string[] {"test"})]
		[TestCase("t[ee]s\nst", new string[] {"test"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithRepeatingCharactersArtifactsAndSpacesOrNewLines(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("smeghead", new string[] {"smeg"})]
		[TestCase("brainfuck", new string[] {"fuck"})]
		[TestCase("computadora", new string[] {"puta"})]
		public void WordScanner_ShouldReturnFalse_WhenGivenAWordWithWordBoundariesThatDoesNotMatch(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("smeg head", new string[] {"smeg head"})]
		[TestCase("smeg\nhead", new string[] {"smeg\nhead"})]
		[TestCase("/smeghead", new string[] {"/smeghead"})]
		[TestCase("smeg\n<head>", new string[] {"smeg\n<head>"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAWordWithArtifactsAndSpacesOrNewLines(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("smeghead", new string[] {"smeg head"})]
		[TestCase("hellothere", new string[] {"hello there"})]
		[TestCase("smeghead", new string[] {"/smeghead"})]
		[TestCase("smeghead", new string[] {"smeg\n<head>"})]
		[TestCase("smeg <head>", new string[] {"smeg\n<head>"})]
		public void WordScanner_ShouldReturnFalse_WhenGivenAWordWithWordSpacesOrNewLinesButInputDoesNot(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("smeghead", new string[] {"smeg*"})]
		[TestCase("brainfuck", new string[] {"*fuck"})]
		[TestCase("computadora", new string[] {"*puta*"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithOptOutWordBoundaries(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("カイラ🌸", new string[] {"カ*"})]
		[TestCase("नमस्ते", new string[] {"न*"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingUTF8WordWithOptOutWordBoundaries(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("smeghead", new string[] {"*smeg"})]
		[TestCase("brainfuck", new string[] {"fuck*"})]
		[TestCase("computadora", new string[] {"puta"})]
		public void WordScanner_ShouldReturnFalse_WhenGivenAWordWithNonOptOutWordBoundariesThatDoesNotMatch(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("カイラ🌸", new string[] {"*カ"})]
		[TestCase("नमस्ते", new string[] {"*न"})]
		public void WordScanner_ShouldReturnFalse_WhenGivenAWordWithNonOptOutUTF8WordBoundariesThatDoesNotMatch(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsFalse(result.HasMatched);
		}

		[TestCase("test", new string[] {"t[e3]st"})]
		[TestCase("t3st", new string[] {"t[e3]st"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithGroupCharacters(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("teeeeest", new string[] {"t[e3]st"})]
		[TestCase("t333st", new string[] {"t[e3]st"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithRepeatingCharactersInGroupCharacters(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("te33eee33333eeest", new string[] {"t[e3]st"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithAlternatingRepeatingCharactersInGroupCharacters(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("te33eee33 333\neeest", new string[] {"t[e3]st"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingWordWithAlternatingRepeatingCharactersInGroupCharactersAndSpacesOrNewLines(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}

		[TestCase("カイラ🌸", new string[] {"カイラ🌸"})]
		[TestCase("नमस्ते", new string[] {"नमस्ते"})]
		[TestCase("مرحبا", new string[] {"مرحبا"})]
		[TestCase("😀", new string[] {"😀"})]
		public void WordScanner_ShouldReturnTrue_WhenGivenAtLeastOneMatchingUTF8Word(string input, string[] words)
		{
			var scanner = new WordScanner();

			var result = scanner.Check(input, words);

			Assert.IsTrue(result.HasMatched);
		}
	}
}
