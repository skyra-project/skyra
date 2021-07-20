using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class V05_AfkSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "afk.prefix",
                table: "guilds",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "afk.prefix-force",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "afk.role",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "afk.prefix",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "afk.prefix-force",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "afk.role",
                table: "guilds");
        }
    }
}
