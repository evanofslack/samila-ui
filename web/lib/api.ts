import { GeneratorParams } from "../interfaces";

export const PROJECTIONS = ["rectilinear", "polar", "hammer", "aitoff", "lambert", "mollweide"];
export const MAX_EQ = 54;
export const MAX_SEED = 1048576;

// the API takes hex colours without the leading '#'
function hex(color: string): string {
    return color.replace(/^#/, "").toLowerCase();
}

export function imageQuery(params: GeneratorParams): URLSearchParams {
    const query = new URLSearchParams({
        eq: String(params.eq),
        proj: params.proj,
        color: hex(params.color),
        bg: hex(params.bg),
        spot: String(params.spot),
    });
    if (params.seed !== null) {
        query.set("seed", String(params.seed));
    }
    return query;
}

// a message for a failed response, from the API's detail when it gives one
export async function errorMessage(resp: Response): Promise<string> {
    try {
        const body = await resp.json();
        if (typeof body.detail === "string") {
            return body.detail;
        }
        if (Array.isArray(body.detail) && body.detail[0]?.msg) {
            return body.detail.map((d: { msg: string }) => d.msg).join("; ");
        }
    } catch {
        // not JSON; fall back to the status
    }
    return `request failed (${resp.status})`;
}
