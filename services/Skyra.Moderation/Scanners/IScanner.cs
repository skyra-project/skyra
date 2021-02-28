namespace Skyra.Moderation.Scanners
{
    internal interface IScanner<out TReturnType>
    {
        TReturnType Run(StructuredSentence sentence);
    }
}
