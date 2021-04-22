using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class V03_NewSocialFeaturesAndValueRename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "social.achieve",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "social.achieve-message",
                table: "guilds");

            migrationBuilder.AddColumn<string>(
                name: "social.achieve-channel",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "social.achieve-level",
                table: "guilds",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "social.achieve-multiple",
                table: "guilds",
                type: "smallint",
                nullable: false,
                defaultValueSql: "1");

            migrationBuilder.AddColumn<string>(
                name: "social.achieve-role",
                table: "guilds",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "social.achieve-channel",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "social.achieve-level",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "social.achieve-multiple",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "social.achieve-role",
                table: "guilds");

            migrationBuilder.AddColumn<bool>(
                name: "social.achieve",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "social.achieve-message",
                table: "guilds",
                type: "varchar",
                nullable: true);
        }
    }
}
