javascript: (
    function () { 
        let sEnvironment = prompt("Enter the environment id"); 
        if (sEnvironment) { let sFlow = prompt("Enter the flow id"); 
            let url = "https://admin.powerplatform.microsoft.com/manage/environments/" + 
            sEnvironment + "/flows/" + sFlow + "/details"; window.open(url, "_blank"); 
        } 
    }
)();
