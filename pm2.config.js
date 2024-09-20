/**
 * 개발모드로 실행
 *      pm2 start pm2.config.js
 * 배포모드로 실행
 *      pm2 start pm2.config.js --env production
 *
 * Field                Type        Example                                     Description
 * name                 string      “myAPI”                                     name your app will have in PM2
 * script               string      “bin/app.js”                                path of your app
 * args                 list        [”–enable-logs”, “-n”, “15”]                arguments given to your app when it is launched
 * node_args            list        [”–harmony”, “–max-stack-size=1024”]        arguments given to node when it is launched
 * cwd                  string      “/var/www/app/prod”                         the directory from which your app will be launched
 * exec_mode            string      “cluster”                                   “fork” mode is used by default, “cluster” mode can be configured with instances field
 * instances            number      4                                           number of instances for your clustered app, 0 means as much instances as you have CPU cores. a negative value means CPU cores - value (e.g -1 on a 4 cores machine will spawn 3 instances)
 * exec_interpreter     string      “node”                                      defaults to “node”. can be “python”, “ruby”, “bash” or whatever interpreter you wish to use. “none” will execute your app as a binary executable
 * log_date_format      string      “YYYY-MM-DD HH:mm Z”                        format in which timestamps will be displayed in the logs
 * error_file           string      “/var/log/node-app/node-app.stderr.log”     path to the specified error log file. PM2 generates one by default if not specified and you can find it by typing pm2 desc <app id>
 * out_file             string      “/var/log/node-app/node-app.stdout.log”     path to the specified output log file. PM2 generates one by default if not specified and you can find it by typing pm2 desc <app id>
 * pid_file             string      “pids/node-geo-api.pid”                     path to the specified pid file. PM2 generates one by default if not specified and you can find it by typing pm2 desc <app id>
 * merge_logs           boolean     false                                       defaults to false. if true, it will merge logs from all instances of the same app into the same file
 * cron_restart         string      “1 0 * * *”                                 a cron pattern to restart your app. only works in “cluster” mode for now. soon to be avaible in “fork” mode as well
 * watch                boolean     true                                        enables the watch feature, defaults to “false”. if true, it will restart your app everytime a file change is detected on the folder or subfolder of your app.
 * ignore_watch         list        [”[\/\\]\./”, “node_modules”]               list of regex to ignore some file or folder names by the watch feature
 * min_uptime           number      1000                                        min uptime of the app to be considered started (i.e. if the app crashes in this time frame, the app will only be restarted the number set in max_restarts (default 15), after that it’s errored)
 * max_restarts         number      10                                          number of consecutive unstable restarts (less than 1sec interval or custom time via min_uptime) before your app is considered errored and stop being
 * max_memory_restart   string      “150M”                                      your app will be restarted by PM2 if it exceeds the amount of memory specified. human-friendly format : it can be “10M”, “100K”, “2G” and so on…
 * env                  object      {“NODE_ENV”: “production”, “ID”: “42”}      env variables which will appear in your app
 * autorestart          boolean     false                                       true by default. if false, PM2 will not restart your app if it crashes or ends peacefully
 * vizion               boolean     false                                       true by default. if false, PM2 will start without vizion features (versioning control metadatas)
 * post_update          list        [“npm install”, “echo launching the app”]   a list of commands which will be executed after you perform a Pull/Upgrade operation from Keymetrics dashboard
 * force                boolean     true                                        defaults to false. if true, you can start the same script several times which is usually not allowed by PM2
 * next_gen_js          boolean     true                                        defaults to false. if true, PM2 will launch your app using embedded BabelJS features which means you can run ES6/ES7 javascript code
 * restart_delay        number      4000                                        time to wait before restarting a crashed app (in milliseconds). defaults to 0.
 */
module.exports = {
  apps: [
    {
      name: "push_server",
      script: "./dist/src/main.js",
      instances: 1,
      exec_mode: "cluster",
      node_args: ["--expose-gc"],
      env_localhost: {
        NODE_ENV: "development",
        SERVER_ENV: "localhost",
        DEBUG: "log:*",
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: "development",
        SERVER_ENV: "development",
        DEBUG: "log:*",
        PORT: 3001,
      },
      env_test: {
        NODE_ENV: "test",
        SERVER_ENV: "test",
        DEBUG: "log:*",
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        SERVER_ENV: "production",
        DEBUG: "log:*",
        PORT: 3001,
      },
    },
  ],
};
