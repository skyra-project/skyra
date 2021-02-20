using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Skyra.Database.Extensions
{
	public static class DbSetExtensions
	{
		public static async Task<T> UpsertAsync<T>(this DbSet<T> db, object key, Func<T> data) where T : class
		{
			var entity = await db.FindAsync(key);

			if (entity is null)
			{
				entity = data();
				await db.AddAsync(entity);
			}

			return entity;
		}
	}
}
