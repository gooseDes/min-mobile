export function CreateUserData(obj: any = {}): UserData {
    const o = obj || {};
    return {
        id: o.id || -1,
        name: o.name || "Unknown",
    };
}
