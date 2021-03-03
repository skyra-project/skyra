namespace Skyra.Database.Models
{
	public struct UserProfileData
	{
		public int Color { get; init; }
		public int Points { get; init; }
		public int Reputations { get; init; }
		public long Money { get; init; }
		public long Vault { get; init; }
		public string BannerId { get; init; }
		public string[] BadgeIds { get; init; }
	}
}
