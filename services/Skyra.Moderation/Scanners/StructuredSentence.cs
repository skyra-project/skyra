using System.Collections.Generic;

namespace Skyra.Moderation.Scanners
{
    public readonly struct StructuredSentence
    {
        public char[] Characters { get; }
        public bool[] Boundaries { get; }
        public int[] Indexes { get; }
        public int Length => Characters.Length;

        public StructuredSentence(string sentence)
        {
            Characters = sentence.ToCharArray();
            Boundaries = new bool[Characters.Length];
            var indexes = new List<int>();

            Characters[0] = char.ToLowerInvariant(Characters[0]);
            for (var i = 1; i < Characters.Length - 1; ++i)
            {
                Characters[i] = char.ToLowerInvariant(Characters[i]);

                if (char.IsLetterOrDigit(Characters[i])) continue;
                Boundaries[i] = true;
                indexes.Add(i);
            }
            Characters[^1] = char.ToLowerInvariant(Characters[^1]);

            Boundaries[0] = true;
            Boundaries[^1] = true;
            Indexes = indexes.ToArray();
        }
    }
}
