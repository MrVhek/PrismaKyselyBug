const jestConfig = {
	moduleDirectories: ["node_modules"],
	moduleFileExtensions: ["js", "mjs", "ts"],
	extensionsToTreatAsEsm: [".ts"],
	preset: "ts-jest/presets/default-esm",
	transform: {
		"^.+\\.tsx?$": "ts-jest/legacy",
	},
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
			useESM: true,
		},
	},
	// Only one because some tests will fail if run in parallel
	maxWorkers: 1,
	reporters: ["default", "github-actions"],
}

export default jestConfig
