using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
    public partial class V02_AddRoleInitialHumanBot : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "roles.initial-bots",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "roles.initial-humans",
                table: "guilds",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "roles.initial-bots",
                table: "guilds");

            migrationBuilder.DropColumn(
                name: "roles.initial-humans",
                table: "guilds");
        }
    }
}
