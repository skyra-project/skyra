using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Skyra.Database.Migrations
{
	public partial class V06_EventsModernization : Migration
	{
		private readonly string[] _oldChannelKeys = {
			"channels.logs.member",
			"channels.logs.message",
			"channels.logs.nsfw-message"
		};

		private readonly string[] _oldEventKeys = {
			"events.member-add",
			"events.member-remove",
			"events.member-nickname-update",
			"events.member-username-update",
			"events.member-role-update",
			"events.message-delete",
			"events.message-edit"
		};

		private readonly string[] _newKeys = {
			"channels.logs.member-add",
			"channels.logs.member-remove",
			"channels.logs.member-nickname-update",
			"channels.logs.member-username-update",
			"channels.logs.member-roles-update",
			"channels.logs.message-delete",
			"channels.logs.message-delete-nsfw",
			"channels.logs.message-update",
			"channels.logs.message-update-nsfw"
		};

		protected override void Up(MigrationBuilder migrationBuilder)
		{
			foreach (var key in _newKeys)
			{
				migrationBuilder.AddColumn<string>(
					name: key,
					table: "guilds",
					type: "character varying(19)",
					maxLength: 19,
					nullable: true);
			}

			foreach (var key in _oldChannelKeys)
			{
				migrationBuilder.DropColumn(
					name: key,
					table: "guilds");
			}

			foreach (var key in _oldEventKeys)
			{
				migrationBuilder.DropColumn(
					name: key,
					table: "guilds");
			}
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{
			foreach (var key in _oldEventKeys)
			{
				migrationBuilder.AddColumn<bool>(
					name: key,
					table: "guilds",
					type: "boolean",
					nullable: false,
					defaultValueSql: "false");
			}

			foreach (var key in _oldChannelKeys)
			{
				migrationBuilder.AddColumn<string>(
					name: key,
					table: "guilds",
					type: "character varying(19)",
					maxLength: 19,
					nullable: true);
			}

			foreach (var key in _newKeys)
			{
				migrationBuilder.DropColumn(
					name: key,
					table: "guilds");
			}
		}
	}
}
