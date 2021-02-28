using System.Collections.Generic;
using System.Linq;

namespace Skyra.Moderation.Scanners
{
    internal class Sentence : IScanner<List<Capture>>
    {
        public Word[] Words { get; }

        public Sentence(IEnumerable<string> words)
        {
            Words = words.Select(word => new Word {Content = word}).ToArray();
        }

        public List<Capture> Run(StructuredSentence sentence)
        {
            var list = new List<Capture>();
            foreach (var word in Words)
            {
                list.AddRange(word.Run(sentence));
            }

            return list;
        }
    }
}
