#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import input from "@inquirer/input";
import select from "@inquirer/select";
import checkbox from "@inquirer/checkbox";
import { DodoSync } from "../index";

const supportedDatabases = ["mongodb"];
const supportedScopes = ["licences", "payments", "customers", "subscriptions"] as const;

type SupportedScope = (typeof supportedScopes)[number];

async function runInteractive(): Promise<{
    interval: number;
    database: string;
    databaseUri: string;
    apiKey?: string;
    env?: "live_mode" | "test_mode" | string;
    scopes: string[];
}> {
    const rawInterval = await input({
        message: "Interval in seconds (e.g. 60):",
        validate: (v: string) => {
            const n = Number(v);
            return Number.isInteger(n) && n > 0 ? true : "Please enter a positive integer.";
        },
    });

    const database = await select({
        message: "Database type:",
        choices: supportedDatabases.map((d) => ({ name: d, value: d })),
    });

    const databaseUri = await input({
        message: "Database connection URI:",
        validate: (v: string) => (v?.trim() ? true : "Database URI cannot be empty."),
    });

    const scopes = await checkbox({
        message: "Scopes to sync:",
        choices: supportedScopes.map((scope) => ({ name: scope, value: scope })),
    });

    const apiKey = await input({
        message: "Dodo Payments API key:",
        validate: (v: string) => (v?.trim() ? true : "API key cannot be empty."),
    });

    const env = await select({
        message: "Environment:",
        choices: [
            { name: "Test Mode", value: "test_mode" },
            { name: "Live Mode", value: "live_mode" },
        ],
    });

    return {
        interval: Number(rawInterval),
        database,
        databaseUri,
        scopes,
        apiKey: apiKey || undefined,
        env,
    };
}

async function main() {
    const noArgs = process.argv.slice(2).length === 0;

    const parser = yargs(hideBin(process.argv))
        .scriptName("dodo-sync")
        .usage("$0 [options]")
        .option("interval", {
            alias: "i",
            type: "string",
            description: "Interval for data fetching (seconds)",
        })
        .option("database", {
            alias: "d",
            type: "string",
            description: "Database type (mongodb)",
        })
        .option("database-uri", {
            alias: "u",
            type: "string",
            description: "Database connection URI",
        })
        .option("api-key", {
            type: "string",
            description: "Dodo Payments API Key",
        })
        .option("scopes", {
            type: "string",
            description: "comma-separated scopes (e.g., 'licences,payments')",
        })
        .option("env", {
            type: "string",
            choices: ["test_mode", "live_mode"],
            description: "Environment ('test_mode' or 'live_mode')",
        })
        .strict()
        .help();

    if (noArgs) {
        console.log("Welcome to Interactive DodoSync Setup 🔄");
        console.log("(run `dodo-sync --help` for non-interactive mode)\n");

        try {
            const answers = await runInteractive();
            return await startDodoSync({
                interval: answers.interval,
                database: (answers.database as any),
                databaseUri: answers.databaseUri,
                scopes: answers.scopes,
                apiKey: answers.apiKey,
                env: answers.env,
            });
        } catch (error) {
            console.error("Interactive mode failed:", error);
            process.exit(1);
        }
    }

    const argv = parser.parseSync();
    const { interval, database, databaseUri, scopes, apiKey, env } = argv as any;

    if (!interval || !database || !databaseUri || !scopes || !apiKey || !env) {
        console.error("Missing required arguments. Use --help for usage.");
        process.exit(1);
    }

    await startDodoSync({
        interval: Number(interval),
        database,
        databaseUri,
        scopes: scopes.split(",").map((x: string) => x.trim()),
        apiKey,
        env,
    });
}

async function startDodoSync({
    interval,
    database,
    databaseUri,
    scopes,
    apiKey,
    env,
}: {
    interval: number;
    database: 'mongodb';
    databaseUri: string;
    scopes: string[];
    apiKey?: string;
    env?: string;
}) {
    if (!supportedDatabases.includes(database)) {
        console.error("Unsupported database type. Only 'mongodb' is allowed.");
        process.exit(1);
    }

    if (scopes.length === 0) {
        console.error("Please select at least one scope.");
        process.exit(1);
    }

    if (scopes.some((scope) => !supportedScopes.includes(scope as SupportedScope))) {
        console.error(`Unsupported scopes provided. Valid scopes: ${supportedScopes.join(", ")}`);
        process.exit(1);
    }

    console.log("🚀 Starting DodoSync with:");
    console.log(`  Interval: ${interval}s`);
    console.log(`  Database: ${database}`);
    console.log(`  Scopes:   ${scopes.join(", ")}`);
    console.log(`  Env:      ${env}`);
    console.log(`  URI:      ************\n`);

    const dodoSync = new DodoSync({
        interval,
        database,
        databaseURI: databaseUri,
        scopes: scopes as any,
        dodoPaymentsOptions: {
            bearerToken: apiKey,
            environment: env as "live_mode" | "test_mode",
        },
    });

    try {
        await dodoSync.init();
        await dodoSync.start();
    } catch (err) {
        console.error("DodoSync failed:", err);
        process.exit(1);
    }
}

main();
