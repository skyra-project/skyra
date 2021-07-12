using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class AddChannelName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "channel_title",
                table: "youtube_subscription",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<decimal>(
                name: "social.multiplier",
                table: "guilds",
                type: "numeric(53)",
                precision: 53,
                nullable: false,
                defaultValueSql: "1",
                oldClrType: typeof(decimal),
                oldType: "numeric(53,0)",
                oldPrecision: 53,
                oldDefaultValueSql: "1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "channel_title",
                table: "youtube_subscription");

            migrationBuilder.AlterColumn<decimal>(
                name: "social.multiplier",
                table: "guilds",
                type: "numeric(53,0)",
                precision: 53,
                nullable: false,
                defaultValueSql: "1",
                oldClrType: typeof(decimal),
                oldType: "numeric(53)",
                oldPrecision: 53,
                oldDefaultValueSql: "1");
        }
    }
}
