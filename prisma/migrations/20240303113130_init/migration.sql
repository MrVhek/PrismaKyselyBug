-- CreateTable
CREATE TABLE "DragAndDropResults" (
    "id" SERIAL NOT NULL,
    "variableId" INTEGER NOT NULL,

    CONSTRAINT "draganddropresults_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variables" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "variables_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableValues" (
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "variableId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "participantUid" TEXT NOT NULL,

    CONSTRAINT "VariableValues_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "VariableCategoricalValues" (
    "variableValueUid" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "labels" JSONB,
    "index" INTEGER,

    CONSTRAINT "VariableCategoricalValues_pkey" PRIMARY KEY ("variableValueUid")
);

-- CreateIndex
CREATE UNIQUE INDEX "draganddropresults_id_uindex" ON "DragAndDropResults"("id");

-- CreateIndex
CREATE UNIQUE INDEX "variables_id_uindex" ON "Variables"("id");

-- CreateIndex
CREATE UNIQUE INDEX "VariableValues_uid_key" ON "VariableValues"("uid");

-- CreateIndex
CREATE INDEX "VariableValues_type_idx" ON "VariableValues"("type");

-- CreateIndex
CREATE UNIQUE INDEX "VariableValues_variableId_type_timestamp_participantUid_key" ON "VariableValues"("variableId", "type", "timestamp", "participantUid");

-- CreateIndex
CREATE UNIQUE INDEX "VariableValues_uid_type_key" ON "VariableValues"("uid", "type");

-- CreateIndex
CREATE UNIQUE INDEX "VariableCategoricalValues_variableValueUid_key" ON "VariableCategoricalValues"("variableValueUid");

-- AddForeignKey
ALTER TABLE "DragAndDropResults" ADD CONSTRAINT "DragAndDropResults_Variables_null_fk" FOREIGN KEY ("variableId") REFERENCES "Variables"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "VariableValues" ADD CONSTRAINT "VariableValues_Variables_null_fk" FOREIGN KEY ("variableId") REFERENCES "Variables"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "VariableCategoricalValues" ADD CONSTRAINT "variablecategoricalvalues_variable_value_uid_type_fk" FOREIGN KEY ("variableValueUid", "type") REFERENCES "VariableValues"("uid", "type") ON DELETE CASCADE ON UPDATE RESTRICT;
