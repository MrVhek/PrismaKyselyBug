import {PrismaClient} from "@prisma/client"
import {Kysely, sql, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler} from "kysely"
import kyselyExtension from "../prismaextensionkysely"
import {DB} from "../../prisma/kyselyTypes"

function createPrismaClient() {
	const basePrisma = new PrismaClient({
		transactionOptions: {
			maxWait: 10000, // default: 2000
			timeout: 20000, // default: 5000
			// isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
		},
		log: [
			{
				emit: "event",
				level: "query",
			},
			{
				emit: "event",
				level: "info",
			},
		],
		datasources: {
			db: {
				url: "postgresql://postgres:docker@localhost:5432/postgres",
			},
		},
	})
	basePrisma.$on("query" as never, (e: any) => {
		console.log(`${e.query}: duration: ${e.duration} ms`)
	})
	basePrisma.$on("info" as never, (e: any) => {
		console.log(e.message)
	})

	return basePrisma.$extends(
		kyselyExtension({
			kysely: (driver) =>
				new Kysely<DB>({
					dialect: {
						// This is where the magic happens!
						createDriver: () => driver,
						// Don't forget to customize these to match your database!
						createAdapter: () => new PostgresAdapter(),
						createIntrospector: (db) => new PostgresIntrospector(db),
						createQueryCompiler: () => new PostgresQueryCompiler(),
					},
					plugins: [
						// Add your favorite plugins here!
					],
				}),
		}),
	)
}
export type ExtPrismaClient = ReturnType<typeof createPrismaClient>
export type PrismaTransaction = Parameters<Parameters<ExtPrismaClient["$transaction"]>[0]>[0]
export const prisma = createPrismaClient()

export function values<R extends Record<string, unknown>, A extends string>(
	records: R[],
	alias: A,
) {
	// Assume there's at least one record and all records
	// have the same keys.
	const keys = Object.keys(records[0])

	// Transform the records into a list of lists such as
	// ($1, $2, $3), ($4, $5, $6)
	const values = sql.join(records.map((r) => sql`(${sql.join(keys.map((k) => r[k]))})`))

	// Create the alias `v(id, v1, v2)` that specifies the table alias
	// AND a name for each column.
	const wrappedAlias = sql.ref(alias)
	const wrappedColumns = sql.join(keys.map(sql.ref))
	const aliasSql = sql`${wrappedAlias}(${wrappedColumns})`

	// Finally create a single `AliasedRawBuilder` instance of the
	// whole thing. Note that we need to explicitly specify
	// the alias type using `.as<A>` because we are using a
	// raw sql snippet as the alias.
	return sql<R>`(values ${values})`.as<A>(aliasSql)
}
