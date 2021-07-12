using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class YoutubeMessageLengthUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AlterColumn<string>(
                name: "notifications.youtube.message",
                table: "guilds",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(19)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AlterColumn<string>(
                name: "notifications.youtube.message",
                table: "guilds",
                type: "character varying(19)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
