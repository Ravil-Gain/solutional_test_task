import app from "./app";

const PORT = parseInt(process.env.PORT as string, 10) || 7000

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})