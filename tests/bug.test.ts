import {describe, expect, it} from "@jest/globals"
import "dotenv/config"
import {prisma, PrismaTransaction} from "../src/db/prisma"

export const objectIDs = new WeakMap<object, string>()
export let currentID = 0

export async function sleepUntilInSynchronisationTable(synchronisationTable: string[], stringExpected: string) {
    console.log(`Waiting for synchronisation point ${stringExpected}`)
    while (!synchronisationTable.includes(stringExpected)) {
        console.log(synchronisationTable)
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    console.log(`Synchronisation point ${stringExpected} reached`)
}

export function getUniqueIdForObject(obj: object): string {
	if (!objectIDs.has(obj)) {
		const id = `unique_id_${++currentID}`
		objectIDs.set(obj, id)
	}
	return objectIDs.get(obj)!
}

export async function addDragAndDropResult(
	tx: PrismaTransaction,
    name: string,
    timestamp: Date,
    synchronisationTable: string[],
) {
    console.log(`Creating drag and drop result in ${name} transaction`)
	const dragAndDropResult = await tx.dragAndDropResults.create({
		data: {variableId: 1},
	})

    console.log(`Selecting associated variables in ${name} transaction`)
	const questionVariables = await tx.variables.findMany({
		where: {
			id: dragAndDropResult.variableId,
		},
	})

    console.log(`Inserting variable values in ${name} transaction`)
	const variableValues = await tx.$kysely
		.insertInto("VariableValues")
		.values([{
			variableId: questionVariables[0].id,
			timestamp: timestamp,
			participantUid: "test",
            type: "CATEGORICAL",
		}])
		.returning(["VariableValues.uid", "VariableValues.variableId", "VariableValues.timestamp"])
		.execute()
	// const variableValues = (await tx.$queryRawUnsafe(
	// 	variableValuesQuery.sql,
	// 	...variableValuesQuery.parameters,
	// )) as {uid: string; variableId: number; timestamp: Date}[]

    // Waiting for second transaction to end inserting variable values
    if (name === "first") {
        await sleepUntilInSynchronisationTable(synchronisationTable, "secondVariableValuesInserted")
    } else if (name === "second") {
        console.log(`Inserting secondVariableValuesInserted for synchronization`)
        synchronisationTable.push("secondVariableValuesInserted")
    }

    console.log(`Inserting variable values in ${name} transaction`)
    await tx.variableCategoricalValues.createMany({
        data: [{
            variableValueUid: variableValues[0].uid,
            type: "CATEGORICAL",
            index: 1,
            labels: [],
        }],
    })
}

describe("Tests", () => {
	it("Tests", async () => {
        const variable =await prisma.variables.findFirst({
            where: {
                id: 1,
            }
        })

        if (!variable) {
            await prisma.variables.create({
                data: {
                    id: 1,
                }
            })
        }

        // Cleaning
        await prisma.variableValues.deleteMany()
        await prisma.dragAndDropResults.deleteMany()

        // Counting the number of rows in the tables before the test
		const variableValuesCount = await prisma.variableValues.count()
		const resultsTableCount = await prisma.dragAndDropResults.count()

        // We will try to insert two drag and drop results and variables values associated
		console.log("Prisma client object id: ", getUniqueIdForObject(prisma))

        const timestamp = new Date()
        const synchronisationTable: string[] = []

        await Promise.all([
            prisma.$transaction(async (tx: PrismaTransaction) => {
				console.log("Prisma transaction 1 object id: ", getUniqueIdForObject(tx))
                return await addDragAndDropResult(
                    tx,
                    "first",
                    timestamp,
                    synchronisationTable,
                )
            }).then(() => console.log("First transaction done"))
            .catch((e) => console.error("First transaction error: ", e)),
			prisma.$transaction(async (tx2: PrismaTransaction) => {
				console.log("Prisma transaction 2 object id: ", getUniqueIdForObject(tx2))
                return await addDragAndDropResult(
                    tx2,
                    "second",
                    timestamp,
                    synchronisationTable,
                )
            }).then(() => console.log("Second transaction done"))
            .catch((e) => console.error("Second transaction error: ", e)),
        ])

		const newVariableValuesCount = await prisma.variableValues.count()
		const newResultsTableCount = await prisma.dragAndDropResults.count()

		expect(variableValuesCount).toBe(newVariableValuesCount)
		expect(resultsTableCount).toBe(newResultsTableCount)
	})
})
