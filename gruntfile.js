module.exports = function(grunt) {
	grunt.initConfig({
        clean: {
            build: ['dist']
        },
        copy: {
            dist: {
                files: [
                    {src: 'index.html', dest: 'dist/index.html'},
					{cwd: 'Styles', src: '*.css', dest: 'dist/Styles', expand: true}
                ]
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
            default : {
                src: ["src/**/*.ts"],
                outDir: 'dist/Build',
                options: {
                    declaration: true,
                    sourceMap: true,
                    module: 'amd',
                },
            },
            release: {
                src: ["Scripts/**/*.ts"],
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
	grunt.loadNpmTasks('grunt-tsd');
	grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-build-control');

    grunt.registerTask('installDeps', ['bower', 'tsd']);
	grunt.registerTask('build-dev', ['clean', 'installDeps', 'ts:default', 'copy']);
    grunt.registerTask('build-release', ['clean', 'installDeps', 'ts:release', 'copy']);
    grunt.registerTask('deploy', ['build-release', 'buildcontrol']);
	grunt.registerTask('default', ['build-dev']);

};