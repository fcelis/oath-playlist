request({
        url: getProjects,
        headers: {
            Authorization: auth
        }
    },
    function (error, response, body) {
        var holdGetProjects = JSON.parse(response.body);
        for (i = 0; i < holdGetProjects.data.length; i++) {
            holdProjects[i] = {
                name: holdGetProjects.data[i].projectKey,
                id: holdGetProjects.data[i].id
            };
        }
        console.log('Projects: ' + holdProjects);
    }
);