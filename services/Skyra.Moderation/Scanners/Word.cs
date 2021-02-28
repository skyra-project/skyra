using System.Collections.Generic;

namespace Skyra.Moderation.Scanners
{
    public readonly struct Word : IScanner<List<Capture>>
    {
        /// <summary>
        /// The word's content, this is assumed to be always in lower case.
        /// </summary>
        public string Content { get; init; }

        public int Length => Content.Length;

        // TODO(kyranet): Add optional boundary checks in both directions.
        public List<Capture> Run(StructuredSentence sentence)
        {
            var list = new List<Capture>();
            var max = Length - 1;
            var start = 0;

            for (int src = 0, dest = 0; dest < sentence.Length; ++dest)
            {
                // If the current character matches, we add one to the src counter and skip:
                var c = sentence.Characters[dest];
                if (MatchLetter(src, c))
                {
                    if (src == 0)
                        start = dest;
                    if (src != max)
                        ++src;
                    continue;
                }

                // If the previous character matches, skip:
                if (MatchPreviousLetter(src, c))
                {
                    continue;
                }

                // TODO(kyranet): Check next bound index for potential multi-word continuations.

                // The chain has been broken, if src was maximum, then it got a full capture, we add it to the list:
                if (src == max)
                {
                    list.Add(new Capture {Start = start, Length = dest - start});
                }

                // Reset src to 0:
                src = 0;
            }

            return list;
        }

        private bool MatchLetter(int src, char c)
        {
            return Content[src] == c;
        }

        private bool MatchPreviousLetter(int src, char c)
        {
            // If the previous character matches, skip:
            return src > 0 && MatchLetter(src - 1, c);
        }
    }
}
