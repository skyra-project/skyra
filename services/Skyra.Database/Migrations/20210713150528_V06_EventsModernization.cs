using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class V06_EventsModernization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "events.member-add",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "events.member-nickname-update",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "events.member-remove",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "events.member-role-update",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "events.message-delete",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "events.message-edit",
                table: "guilds");

            migrationBuilder.RenameColumn(
                name: "channels.logs.nsfw-message",
                table: "guilds",
                newName: "channels.logs.message-update-nsfw");

            migrationBuilder.RenameColumn(
                name: "channels.logs.message",
                table: "guilds",
                newName: "channels.logs.message-update");

            migrationBuilder.RenameColumn(
                name: "channels.logs.member",
                table: "guilds",
                newName: "channels.logs.message-delete-nsfw");

            migrationBuilder.AddColumn<string>(
                name: "channels.logs.member-add",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "channels.logs.member-nickname-update",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "channels.logs.member-remove",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "channels.logs.member-role-update",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "channels.logs.member-username-update",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "channels.logs.message-delete",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "channels.logs.member-add",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "channels.logs.member-nickname-update",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "channels.logs.member-remove",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "channels.logs.member-role-update",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "channels.logs.member-username-update",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "channels.logs.message-delete",
                table: "guilds");

            migrationBuilder.RenameColumn(
                name: "channels.logs.message-update-nsfw",
                table: "guilds",
                newName: "channels.logs.nsfw-message");

            migrationBuilder.RenameColumn(
                name: "channels.logs.message-update",
                table: "guilds",
                newName: "channels.logs.message");

            migrationBuilder.RenameColumn(
                name: "channels.logs.message-delete-nsfw",
                table: "guilds",
                newName: "channels.logs.member");

            migrationBuilder.AddColumn<bool>(
                name: "events.member-add",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValueSql: "false");

            migrationBuilder.AddColumn<bool>(
                name: "events.member-nickname-update",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValueSql: "false");

            migrationBuilder.AddColumn<bool>(
                name: "events.member-remove",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValueSql: "false");

            migrationBuilder.AddColumn<bool>(
                name: "events.member-role-update",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValueSql: "false");

            migrationBuilder.AddColumn<bool>(
                name: "events.message-delete",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValueSql: "false");

            migrationBuilder.AddColumn<bool>(
                name: "events.message-edit",
                table: "guilds",
                type: "boolean",
                nullable: false,
                defaultValueSql: "false");
        }
    }
}
