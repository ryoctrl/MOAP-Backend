module.exports = {
    apps: [
        {
            name: 'MOAP-Backend',
            script: 'npm',
            args: 'start',
            watch: ['controllers/', 'routes/', 'models/'],
        }
    ]
}
