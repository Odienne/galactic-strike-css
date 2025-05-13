export const GridInitEvent = new CustomEvent("GridInitEvent", {
    detail: {
        message: "Grid init",
        time: new Date(),
    },
});
