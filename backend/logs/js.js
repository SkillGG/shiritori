/**
 * @type {HTMLDivElement}
 */
const el = document.querySelector("#events");

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
const addLog = (log, _n, _ar) => {
    const div = document.createElement("div");
    div.style.backgroundColor =
        log.eventType === "request"
            ? Math.trunc(log.response.status / 100) === 2
                ? "green"
                : "red"
            : "red";
    div.title = `${log.route}`;
    div.classList.add("log");
    el.appendChild(div);
    div.innerHTML = `<div class="logTitle">${log.eventType}<br/>
    /${log.route}</div>
    <fieldset>
    <legend>Response</legend>
    <div class="logValue">
    ${JSON.stringify(log.response.value)}
    </div>
    </fieldset>
    <div class="logStatus">${log.response.status}</div>
    <div class="logDates" title="${getDate(log.time.in)}\n${getDate(
        log.time.out
    )}">${log.time.out - log.time.in}ms</div>`;
};

json.forEach(addLog);
