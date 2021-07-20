using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class V07_YoutubeNotifications : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "notifications.youtube.channel",
                table: "guilds",
                type: "character varying(19)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notifications.youtube.message",
                table: "guilds",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "youtube_subscription",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    already_seen_ids = table.Column<string[]>(type: "character varying(11)[]", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    guild_ids = table.Column<string[]>(type: "character varying(19)[]", nullable: false),
                    channel_title = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_youtube_subscription", x => x.id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "youtube_subscription");

            migrationBuilder.DropColumn(
                name: "notifications.youtube.channel",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "notifications.youtube.message",
                table: "guilds");
        }
    }
}
