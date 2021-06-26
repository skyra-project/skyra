using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class YoutubeNotifications_Final : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "id",
                table: "youtube_subscription",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(11)",
                oldMaxLength: 11);

            migrationBuilder.AddColumn<string[]>(
                name: "already_seen_ids",
                table: "youtube_subscription",
                type: "character varying(11)[]",
                nullable: false,
                defaultValue: new string[0]);

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

            migrationBuilder.AddColumn<string>(
                name: "notifications.youtube.channel",
                table: "guilds",
                type: "character varying(19)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "notifications.youtube.message",
                table: "guilds",
                type: "character varying(19)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "already_seen_ids",
                table: "youtube_subscription");

            migrationBuilder.DropColumn(
                name: "notifications.youtube.channel",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "notifications.youtube.message",
                table: "guilds");

            migrationBuilder.AlterColumn<string>(
                name: "id",
                table: "youtube_subscription",
                type: "character varying(11)",
                maxLength: 11,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(24)",
                oldMaxLength: 24);

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
