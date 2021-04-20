using System;

namespace Skyra.Moderation.Parsers
{
	public class ScannerMatch
	{
		public string[] Matches { get; set; }
		public bool HasMatched => Matches.Length > 0;

		public ScannerMatch()
		{
			Matches = Array.Empty<string>();
		}

		public ScannerMatch(string match)
		{
			Matches = new[] {match};
		}

		public ScannerMatch(string[] matches)
		{
			Matches = matches;
		}

		public static ScannerMatch FromFailure() => new ScannerMatch();
		public static ScannerMatch FromSuccess(string match) => new ScannerMatch(match);
		public static ScannerMatch FromSuccess(string[] matches) => new ScannerMatch(matches);
	}
}
