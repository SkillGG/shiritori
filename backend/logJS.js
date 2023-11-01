/**
 * @type {HTMLDivElement}
 */
const el = document.querySelector("#events");
document.body.style.margin = "0";
document.body.style.paddingBlockStart = "0";
document.body.style.backgroundColor = "#333c";

el.style.display = "flex";
el.style.flexDirection = "column";
el.style.width = "max-content";
el.style.justifyItems = "middle";
el.style.alignContent = "center";
el.style.margin = "0 auto";
el.style.width = "50%";
el.style.overflowY = "scroll";
el.style.overflowX = "auto";
/* type Log<T extends "request" | "error"> = {
    eventType: T;
    route: T extends "request" ? string : never;
    response: { status: number; value: any };
}; */
/**
 * @typedef {{eventType: T,route: keyof serverRoutes,time: { in: number; out: number },response: { status: number; value: T extends "request" ? any : never }}} Log
 */

/**
 *
 * @param {number} n
 */
const getDate = (n) => {
    const d = new Date(n);
    return (
        `${d.getDay()}`.padStart(2, "0") +
        "/" +
        `${d.getMonth() + 1}`.padStart(2, "0") +
        " " +
        `${d.getHours()}`.padStart(2, "0") +
        `:` +
        `${d.getMinutes()}`.padStart(2, "0") +
        ":" +
        `${d.getSeconds()}`.padStart(2, "0") +
        `.` +
        `${d.getMilliseconds()}`.padStart(3, "0")
    );
};

/**
 *
 * @param {Log} log
 * @param {number} index
 * @param {Log[]} arr
 */
const addLog = (log, index, arr) => {
    const div = document.createElement("div");
    div.style.display = "grid";
    div.title = `${log.route}`;
    div.style.gridTemplateAreas = "'t . .''v v v''cin . .''. . cout'";
    div.style.backgroundColor =
        log.eventType === "request"
            ? Math.trunc(log.response.status / 100) === 2
                ? "green"
                : "red"
            : "red";
    div.style.border = "1px solid black";
    div.style.borderRadius = "10px";
    div.style.padding = "10px";
    div.style.minWidth = "25%";
    div.style.margin = "5px auto";
    el.appendChild(div);
    div.innerHTML = `<div style="grid-area: t; white-space: nowrap;">${
        log.eventType
    }<br/>
    /${log.route}</div>
    <fieldset style="display: grid;grid-area: v; margin: 5px 0; justify-self: center;border: 1px solid black;padding: 10px;">
    <legend style="padding: 0; margin: 0;">Response</legend>
    <div style="justify-self: center;">
    ${JSON.stringify(log.response.value)}
    </div>
    </fieldset>
    <div style="grid-area: cin">${log.response.status}</div>
    <div style="grid-area: cout" title="${getDate(log.time.in)}\n${getDate(
        log.time.out
    )}">${log.time.out - log.time.in}ms</div>`;
};

json.forEach(addLog);
