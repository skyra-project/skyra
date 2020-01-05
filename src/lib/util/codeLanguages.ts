export interface Language {
	identifier: string;
	name: string;
	helloworld?: string;
	implementations?: Implementation[];
}

export interface Implementation {
	label: string;
	identifier: string;
	wrappers: Wrapper[];
}

export interface Wrapper {
	identifier: string;
	label: string;
	code: string;
	is_formatter?: boolean;
	is_asm?: boolean;
}

export const languages: Language[] = [
	{
		identifier: 'c',
		name: 'C',
		helloworld: '#include <stdio.h>\n\nint main(void) {\n    puts("Hello, world!");\n    return 0;\n}',
		implementations: [
			{
				label: 'Clang',
				identifier: 'clang',
				wrappers: [
					{
						identifier: 'clang',
						label: 'Run',
						code: 'mv code code.c; clang %s code.c && ./a.out'
					}
				]
			},
			{
				label: 'gcc',
				identifier: 'gcc',
				wrappers: [
					{
						identifier: 'gcc',
						label: 'Run',
						code: 'mv code code.c; gcc %s code.c && ./a.out'
					}
				]
			}
		]
	},
	{
		identifier: 'cpp',
		name: 'C++',
		helloworld: '#include <iostream>\n\nint main(void) {\n    std::cout << "Hello, world!\\n";\n}',
		implementations: [
			{
				label: 'Clang',
				identifier: 'clang',
				wrappers: [
					{
						identifier: 'clangcpp',
						label: 'Run',
						code: 'mv code code.cpp; clang++ %s code.cpp && ./a.out'
					}
				]
			},
			{
				label: 'g++',
				identifier: 'gcc',
				wrappers: [
					{
						identifier: 'gpp',
						label: 'Run',
						code: 'mv code code.cpp; g++ %s code.cpp && ./a.out'
					}
				]
			}
		]
	},
	{
		identifier: 'csharp',
		name: 'C#',
		helloworld: 'using System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello, world!");\n    }\n}',
		implementations: [
			{
				label: '.NET Core',
				identifier: 'netcore',
				wrappers: [
					{
						identifier: 'netcore',
						label: 'Run',
						code: 'dotnet new console &>/dev/null; mv code Program.cs; dotnet run %s'
					}
				]
			}
		]
	},
	{
		identifier: 'go',
		name: 'Go',
		helloworld: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, world!")\n}',
		implementations: [
			{
				label: 'gc',
				identifier: 'gc',
				wrappers: [
					{
						identifier: 'gc',
						label: 'Run',
						code: 'mv code code.go; go run code.go'
					},
					{
						identifier: 'goimports',
						label: 'Format',
						code: 'goimports -w code; cat code',
						is_formatter: true
					}
				]
			}
		]
	},
	{
		identifier: 'haskell',
		name: 'Haskell',
		helloworld: 'main = putStrLn "Hello, world!"',
		implementations: [
			{
				label: 'GHC',
				identifier: 'ghc',
				wrappers: [
					{
						identifier: 'ghc',
						label: 'Run',
						code: 'mv code code.hs; ghc %s code.hs && ./code'
					}
				]
			}
		]
	},
	{
		identifier: 'html',
		name: 'HTML'
	},
	{
		identifier: 'java',
		name: 'Java',
		helloworld: 'class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}',
		implementations: [
			{
				label: 'OpenJDK 8',
				identifier: 'openjdk8',
				wrappers: [
					{
						identifier: 'openjdk8',
						label: 'Run',
						code: "mv code code.java; /etc/alternatives/java_sdk_1.8.0/bin/javac %s code.java; /etc/alternatives/java_sdk_1.8.0/bin/java \"$(perl -e 'my @classes = grep { !/\\$/ } glob q[*.class]; if (@classes == 1) { my $class = $classes[0]; $class =~ s/\\.class\\z//; print $class } else { print q[Main] }')\""
					}
				]
			},
			{
				label: 'OpenJDK 11',
				identifier: 'openjdk11',
				wrappers: [
					{
						identifier: 'openjdk11',
						label: 'Run',
						code: "mv code code.java; /etc/alternatives/java_sdk_11/bin/javac %s code.java; /etc/alternatives/java_sdk_11/bin/java \"$(perl -e 'my @classes = grep { !/\\$/ } glob q[*.class]; if (@classes == 1) { my $class = $classes[0]; $class =~ s/\\.class\\z//; print $class } else { print q[Main] }')\""
					}
				]
			}
		]
	},
	{
		identifier: 'javascript',
		name: 'JavaScript',
		helloworld: 'console.log("Hello, world!");',
		implementations: [
			{
				label: 'Node.js',
				identifier: 'nodejs',
				wrappers: [
					{
						identifier: 'nodejs',
						label: 'Run',
						code: 'node %s code'
					}
				]
			}
		]
	},
	{
		identifier: 'jinja2',
		name: 'Jinja2'
	},
	{
		identifier: 'jsx',
		name: 'JSX'
	},
	{
		identifier: 'markdown',
		name: 'Markdown'
	},
	{
		identifier: 'perl',
		name: 'Perl',
		helloworld: 'use v5.12;\nuse warnings;\n\nsay "Hello, world!";',
		implementations: [
			{
				label: 'Perl',
				identifier: 'perl',
				wrappers: [
					{
						identifier: 'perl',
						label: 'Run',
						code: 'perl %s code'
					}
				]
			}
		]
	},
	{
		identifier: 'php',
		name: 'PHP',
		helloworld: '<?php\necho "Hello, world!\\n";',
		implementations: [
			{
				label: 'PHP',
				identifier: 'php',
				wrappers: [
					{
						identifier: 'php',
						label: 'Run',
						code: 'php %s code'
					}
				]
			}
		]
	},
	{
		identifier: 'postgresql',
		name: 'PostgreSQL'
	},
	{
		identifier: 'python2',
		name: 'Python 2'
	},
	{
		identifier: 'python',
		name: 'Python 3',
		helloworld: 'print("Hello, world!")',
		implementations: [
			{
				label: 'CPython',
				identifier: 'cpython',
				wrappers: [
					{
						identifier: 'cpython',
						label: 'Run',
						code: 'python3 %s code'
					},
					{
						identifier: 'black',
						label: 'Format (black)',
						code: 'black code; cat code',
						is_formatter: true
					}
				]
			}
		]
	},
	{
		identifier: 'raku',
		name: 'Raku',
		helloworld: 'say "Hello, world!"',
		implementations: [
			{
				label: 'Rakudo',
				identifier: 'rakudo',
				wrappers: [
					{
						identifier: 'rakudo',
						label: 'Run',
						code: 'perl6 %s code'
					}
				]
			}
		]
	},
	{
		identifier: 'rust',
		name: 'Rust',
		helloworld: 'fn main() {\n    println!("Hello, world!");\n}',
		implementations: [
			{
				label: 'Stable',
				identifier: 'stable',
				wrappers: [
					{
						identifier: 'rustc-stable',
						label: 'Run',
						code: 'mv code code.rs && rustc %s code.rs && ./code'
					},
					{
						identifier: 'rustc-asm-stable',
						label: 'ASM',
						code: 'rustc --emit asm --crate-type rlib %s code && cat code.s',
						is_asm: true
					},
					{
						identifier: 'rustfmt-stable',
						label: 'Rustfmt',
						code: 'rustfmt code; cat code',
						is_formatter: true
					}
				]
			}
		]
	},
	{
		identifier: 'sh',
		name: 'Sh',
		helloworld: 'echo Hello, world!',
		implementations: [
			{
				label: 'sh',
				identifier: 'sh',
				wrappers: [
					{
						identifier: 'sh',
						label: 'Run',
						code: 'sh %s code'
					}
				]
			}
		]
	},
	{
		identifier: 'sql',
		name: 'SQL'
	},
	{
		identifier: 'sqlite',
		name: 'SQLite',
		helloworld: "SELECT 'Hello, world!'",
		implementations: [
			{
				label: 'SQLite',
				identifier: 'sqlite',
				wrappers: [
					{
						identifier: 'sqlite',
						label: 'Run',
						code: 'sqlite3 %s < code'
					}
				]
			}
		]
	},
	{
		identifier: 'typescript',
		name: 'TypeScript',
		helloworld: 'console.log("Hello, world!");',
		implementations: [
			{
				label: 'Node.js',
				identifier: 'nodejs',
				wrappers: [
					{
						identifier: 'typescript-nodejs',
						label: 'Run',
						code: 'mv code code.ts; /usr/local/bin/tsc %s code.ts && node code'
					}
				]
			}
		]
	},
	{
		identifier: 'tsx',
		name: 'TypeScript-JSX'
	}
];
