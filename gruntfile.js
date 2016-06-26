module.exports = function(grunt) {
	grunt.initConfig({
        clean: {
            build: ['dist']
        },
        copy: {
            dist: {
                files: [
                    {src: 'index.html', dest: 'dist/index.html'},
					{cwd: 'Styles', src: '*.css', dest: 'dist/Styles', expand: true},
					{cwd: 'assets', src: '**/*', dest: 'dist/assets', expand: true}
                ]
            }
        },
        uglify: {
            dist: {         
                files: [{
                    expand: true,
                    cwd: 'dist/Build',
                    src: '**/*.js',
                    dest: 'dist/Build'
                }]
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: './dist/lib'
                }
            }
        },
        ts: {
            dev : {
                src: ["src/**/*.ts"],
                outDir: 'dist/Build',
                options: {
                    declaration: true,
                    sourceMap: true,
                    module: 'amd',
                },
            },
            release: {
                src: ["src/**/*.ts"],
                outDir: 'dist/Build',
                options: {
                    declaration: false,
                    sourceMap: false,
                    module: 'amd',
                },                
            }
        },
        tsd: {
            refresh: {
                options: {
                    command: 'reinstall',
                    path: "typings",
                    latest: false,
                    config: 'tsd.json'
                }
            }
        },
        buildcontrol: {
            options: {
                dir: 'dist',
                commit: true,
                push: true,
                force: true,
                message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
            },
            pages: {
                options: {
                    remote: 'git@github.com:Andrey1024/LICjs.git',
                    branch: 'gh-pages'
                }
            },
        }
	});

	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-tsd');
	grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-build-control');

    grunt.registerTask('installDeps', ['bower']);
	grunt.registerTask('build-dev', ['clean', 'installDeps', 'ts:dev', 'copy']);
    grunt.registerTask('build-release', ['clean', 'installDeps', 'ts:release', 'uglify', 'copy']);
    grunt.registerTask('deploy', ['build-release', 'buildcontrol']);
	grunt.registerTask('default', ['build-dev']);
	grunt.registerTask('dev', ['clean', 'bower', 'ts:dev', 'copy']);

};