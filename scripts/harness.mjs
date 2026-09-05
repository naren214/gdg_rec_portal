// Minimal in-memory Firestore stub exposing only the surface used by the
// route handlers (collection/doc/where/select/orderBy/get/add/set/update +
// runTransaction). Good enough to exercise the real server logic.

let mockUser = null;
export const getMockUser = () => mockUser;
export const setMockUser = (u) => {
  mockUser = u;
};

let counter = 0;
const newId = () => `doc-${++counter}`;

function makeDocRef(db, id, store) {
  return {
    id,
    get: async () => {
      const data = store[id];
      return {
        id,
        exists: !!data,
        data: () => (data ? { ...data } : undefined),
      };
    },
    set: async (payload) => {
      store[id] = { ...payload };
    },
    update: async (payload) => {
      store[id] = { ...(store[id] || {}), ...payload };
    },
  };
}

function makeQuery(store) {
  return {
    _filters: [],
    _select: null,
    where(field, op, value) {
      this._filters.push({ field, op, value });
      return this;
    },
    select(...fields) {
      this._select = fields;
      return this;
    },
    orderBy() {
      return this;
    },
    async get() {
      let docs = Object.entries(store).map(([id, data]) => ({ id, data }));
      for (const f of this._filters) {
        docs = docs.filter((d) => match(d.data[f.field], f.op, f.value));
      }
      return {
        size: docs.length,
        empty: docs.length === 0,
        docs: docs.map(({ id, data }) => ({
          id,
          data: () =>
            this._select
              ? Object.fromEntries(
                  this._select
                    .filter((k) => k in data)
                    .map((k) => [k, data[k]])
                )
              : { ...data },
        })),
      };
    },
  };
}

function match(actual, op, expected) {
  switch (op) {
    case "==":
      return actual === expected;
    default:
      return true;
  }
}

function makeDb(store) {
  return {
    collection() {
      return {
        doc: (id) => makeDocRef(null, id || newId(), store),
        where(field, op, value) {
          return makeQuery(store).where(field, op, value);
        },
        select(...fields) {
          return makeQuery(store).select(...fields);
        },
        orderBy() {
          return makeQuery(store);
        },
        async add(payload) {
          const id = newId();
          store[id] = { ...payload };
          return { id, get: async () => ({ id, exists: true, data: () => ({ ...store[id] }) }) };
        },
      };
    },
    async runTransaction(fn) {
      const tx = {
        async get(ref) {
          // ref is the query object returned by collection().where()
          return await ref.get();
        },
        set(docRef, payload) {
          docRef.set(payload);
        },
        update(docRef, payload) {
          docRef.update(payload);
        },
      };
      return await fn(tx);
    },
  };
}

// Collection registry — tests reference these directly.
export const stores = {
  formData: {},
};

const db = makeDb(stores.formData);

// collection(name) must route to the right store.
const dbRouter = {
  collection(name) {
    const store = stores[name] || (stores[name] = {});
    const base = makeDb(store).collection();
    return base;
  },
  async runTransaction(fn) {
    const store = stores.formData;
    const tx = {
      async get(queryRef) {
        return await queryRef.get();
      },
      set(docRef, payload) {
        return docRef.set(payload);
      },
      update(docRef, payload) {
        return docRef.update(payload);
      },
    };
    return await fn(tx);
  },
};

export const connect = async () => dbRouter;

export const serializeFirestoreData = (value) => {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeFirestoreData);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeFirestoreData(v)])
    );
  }
  return value;
};

export const resetStore = () => {
  for (const k of Object.keys(stores.formData)) delete stores.formData[k];
};
