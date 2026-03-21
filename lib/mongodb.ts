import 'server-only';

import { MongoClient, ServerApiVersion } from 'mongodb';

export class MongoConnectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MongoConnectionError';
    }
}

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

declare global {
    var mongoClientPromise: Promise<MongoClient> | undefined;
    var mongoIndexesPromise: Promise<void> | undefined;
}

function getMongoUri() {
    const value = process.env.MONGO_ATLAS_URI;

    if (!value) {
        throw new MongoConnectionError('Missing MongoDB connection string. Set MONGO_ATLAS_URI in your environment.');
    }

    return value;
}

function getMongoDbName() {
    return process.env.MONGO_DB_NAME ?? 'organiseed';
}

function normalizeMongoConnectionError(error: unknown) {
    if (error instanceof MongoConnectionError) {
        return error;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ECONNREFUSED' &&
        'syscall' in error &&
        error.syscall === 'querySrv'
    ) {
        return new MongoConnectionError(
            'No se pudo resolver la URI de MongoDB Atlas. Tu entorno no esta resolviendo registros DNS SRV para mongodb+srv. Usa una URI estandar de MongoDB Atlas o habilita esa resolucion en tu red.'
        );
    }

    return error;
}

function getMongoClientPromise() {
    if (!global.mongoClientPromise) {
        try {
            const client = new MongoClient(getMongoUri(), options);
            global.mongoClientPromise = client.connect().catch((error) => {
                global.mongoClientPromise = undefined;
                throw normalizeMongoConnectionError(error);
            });
        } catch (error) {
            throw normalizeMongoConnectionError(error);
        }
    }

    return global.mongoClientPromise;
}

export async function getMongoDb() {
    const connectedClient = await getMongoClientPromise();
    return connectedClient.db(getMongoDbName());
}

export async function ensureMongoIndexes() {
    if (!global.mongoIndexesPromise) {
        global.mongoIndexesPromise = (async () => {
            const db = await getMongoDb();
            const projects = db.collection('projects');

            await Promise.all([
                projects.createIndex({ user_id: 1, id: 1 }, { unique: true, name: 'user_project_id_unique' }),
                projects.createIndex({ user_id: 1, createdAt: -1 }, { name: 'user_created_at_desc' }),
            ]);
        })();
    }

    return global.mongoIndexesPromise;
}