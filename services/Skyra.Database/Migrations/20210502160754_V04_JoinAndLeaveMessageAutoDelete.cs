using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class V04_JoinAndLeaveMessageAutoDelete : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "messages.farewell-auto-delete",
                table: "guilds",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "messages.greeting-auto-delete",
                table: "guilds",
                type: "bigint",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "messages.farewell-auto-delete",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "messages.greeting-auto-delete",
                table: "guilds");
        }
    }
}
