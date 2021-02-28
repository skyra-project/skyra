using System;

namespace Skyra.Moderation.Scanners
{
    public struct Capture
    {
        public int Start { get; init; }
        public int Length { get; init; }

        public ReadOnlySpan<char> Span(char[] content)
        {
            return content.AsSpan(Start, Length);
        }
    }
}
