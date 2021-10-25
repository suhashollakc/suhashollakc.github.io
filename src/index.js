import { evaluate } from 'mathjs';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//  
const App = () => {
	const [ theme, setTheme ] = React.useState('dark')
	const themeVars = theme === 'dark' ? {
		app: { backgroundColor: '#333444'},
		terminal: {boxShadow: '0 2px 5px #111'},
		window: {backgroundColor: '#222345', color: '#F4F4F4'},
		field: {backgroundColor: '#222333', color: '#F4F4F4', fontWeight: 'normal'},
		cursor: {animation : '1.02s blink-dark step-end infinite'}
	} : {
		app: {backgroundColor: '#ACA9BB'},
		terminal: {boxShadow: '0 2px 5px #33333375'},
		window: {backgroundColor: '#5F5C6D', color: '#E3E3E3'},
		field: {backgroundColor: '#E3E3E3', color: '#474554', fontWeight: 'bold'},
		cursor: {animation : '1.02s blink-light step-end infinite'}
	}
	
	return <div id="app" style={themeVars.app}>
		<Terminal theme={themeVars} setTheme={setTheme}/>
	</div>
}
const Terminal = ({ theme, setTheme }) => {
	const [ maximized, setMaximized ] = React.useState(false)
	const [ title, setTitle ] = React.useState('Codeminter Portfolio')
	const handleClose = () => (window.location.href = 'http://suhasholla.tech')
	const handleMinMax = () => {
		setMaximized(!maximized)
		document.querySelector('#field').focus()
	}
	
	return <div id="terminal" style={maximized ? {height: '100vh', width: '100vw', maxWidth: '100vw'} : theme.terminal}>
		<div id="window" style={theme.window}>
			<button className="btn red" onClick={handleClose}/>
			<button id="useless-btn" className="btn yellow"/>
			<button className="btn green" onClick={handleMinMax}/>
			<span id="title" style={{color: theme.window.color}}>{title}</span>
		</div>
		<Field theme={theme} setTheme={setTheme} setTitle={setTitle}/>
	</div>
}
class Field extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			commandHistory: [],
			commandHistoryIndex: 0,
			fieldHistory: [{text: 'Welcome to my 🔮'}, {text: 'Type HELP to see the list of commands supported', hasBuffer: true}],
			userInput: '',
			isMobile: false
		}
		this.recognizedCommands = [{
			command: 'help',
			purpose: 'Provides help information regarding commands to explore my portfolio.'
		}, {
			command: 'date',
			purpose: 'Displays the current date.'
		}, {
			command: 'start',
			purpose: 'Launches the URL you enter in a separate new window.',
			help: [
				'START <URL>',
				'Launches the URL in a separate new window.',
				'',
				'URL......................The website you want to open.'
			]
		}, {
			command: 'cls',
			purpose: 'Clears the screen.'
		}, {
			command: 'cmd',
			purpose: 'Starts a new instance of my portfolio terminal.'
		}, {
			command: 'theme',
			purpose: 'Switch color modes for my portfolio',
			help: [
				'THEME [-l, -light, -d, -dark]',
				'Sets the color scheme of my portfolio.',
				'',
				'-l, -light...............Sets the color scheme to light mode.',
				'-d, -dark................Sets the color scheme to dark mode.'
			]
		}, {
			command: 'exit',
			purpose: 'Quits my portfolio terminal and returns to my personal website.'
		}, {
			command: 'time',
			purpose: 'Displays the current time.'
		}, {
			command: 'about',
			isMain: true,
			purpose: 'Displays basic information about Suhas Holla.'
		}, {
			command: 'experience',
			isMain: true,
			purpose: 'Displays information about Suhas\'s experience.'
		},  {
			command: 'education',
			isMain: true,
			purpose: 'Displays information about Suhas\'s education.'
		},{
			command: 'skills',
			isMain: true,
			purpose: 'Displays information about Suhas\'s skills as a developer.'
		}, {
			command: 'contact',
			isMain: true,
			purpose: 'Displays contact information for Suhas.'
		}, {
			command: 'projects',
			isMain: true,
			purpose: 'Displays information about what projects Suhas has done in the past.'
		}, {
			command: 'project',
			isMain: true,
			purpose: 'Launches a specified project in a new tab or separate window.',
			help: [
				'PROJECT <TITLE>',
				'Launches a specified project in a new tab or separate window.',
				'List of projects currently include:',
				'Netflix UI Clone',
				'MMS Desktop App',
				'Taxi Booking App',
				'Lyft Clone',
				'Covid Tracker',
        'Crypto-Wallet',
        'streaming-app',
        'vpn-app',
				'',
				'TITLE....................The title of the project you want to view.'
			]
		}, {
			command: 'title',
			purpose: 'Sets the window title for the Codeminter Portfolio',
			help: [
				'TITLE <INPUT>',
				'Sets the window title for the Codeminter Portfolio.',
				'',
				'INPUT....................The title you want to use for the Codeminter Portfolio window.'
			]
		}]
		this.handleTyping = this.handleTyping.bind(this)
		this.handleInputEvaluation = this.handleInputEvaluation.bind(this)
		this.handleInputExecution = this.handleInputExecution.bind(this)
		this.handleContextMenuPaste = this.handleContextMenuPaste.bind(this)
	}
	componentDidMount() {
		if (typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1) {
			this.setState(state => ({
				isMobile: true,
				fieldHistory: [...state.fieldHistory, {isCommand: true}, {
					text: `Unfortunately due to this application being an 'input-less' environment, mobile is not supported. I'm working on figuring out how to get around this, so please bear with me! In the meantime, come on back if you're ever on a desktop.`,
					isError: true,
					hasBuffer: true
				}]
			}))
		}
		
		const userElem = document.querySelector('#field')
		
		// userElem.focus()
		
		document.querySelector('#useless-btn').addEventListener('click', () => this.setState(state => ({
			fieldHistory: [...state.fieldHistory, {isCommand: true}, {text: 'SYS >> That button doesn\'t do anything.', hasBuffer: true}]
		})))
	}
	componentDidUpdate() {
		const userElem = document.querySelector('#field')
		
		userElem.scrollTop = userElem.scrollHeight
	}
	handleTyping(e) {
		e.preventDefault()
		
		const { key, ctrlKey, altKey } = e
		const forbidden = [
			...Array.from({length: 12}, (x, y) => `F${y + 1}`),
			'ContextMenu', 'Meta', 'NumLock', 'Shift', 'Control', 'Alt',
			'CapsLock', 'Tab', 'ScrollLock', 'Pause', 'Insert', 'Home',
			'PageUp', 'Delete', 'End', 'PageDown'
		]

		if (!forbidden.some(s => s === key) && !ctrlKey && !altKey) {
			if (key === 'Backspace') {
				this.setState(state => state.userInput = state.userInput.slice(0, -1))
			} else if (key === 'Escape') {
				this.setState({ userInput: '' })
			} else if (key === 'ArrowUp' || key === 'ArrowLeft') {
				const { commandHistory, commandHistoryIndex } = this.state
				const upperLimit = commandHistoryIndex >= commandHistory.length
				
				if (!upperLimit) {
					this.setState(state => ({
						commandHistoryIndex: state.commandHistoryIndex += 1,
						userInput: state.commandHistory[state.commandHistoryIndex - 1]
					}))
				}
			} else if (key === 'ArrowDown' || key === 'ArrowRight') {
				const { commandHistory, commandHistoryIndex } = this.state
				const lowerLimit = commandHistoryIndex === 0
				
				if (!lowerLimit) {
					this.setState(state => ({
						commandHistoryIndex: state.commandHistoryIndex -= 1,
						userInput: state.commandHistory[state.commandHistoryIndex - 1] || ''
					}))
				}
			} else if (key === 'Enter') {
				const { userInput } = this.state
				
				if (userInput.length) {
					this.setState(state => ({
						commandHistory: userInput === '' ? state.commandHistory : [userInput, ...state.commandHistory],
						commandHistoryIndex: 0,
						fieldHistory: [...state.fieldHistory, {text: userInput, isCommand: true}],
						userInput: ''
					}), () => this.handleInputEvaluation(userInput))
				} else {
					this.setState(state => ({
						fieldHistory: [...state.fieldHistory, {isCommand: true}]
					}))
				}				
			} else {
				this.setState(state => ({
					commandHistoryIndex: 0,
					userInput: state.userInput += key
				}))
			}
		}
	}
	handleInputEvaluation(input) {
		try {
			const evaluatedForArithmetic = evaluate(input)

			if (!isNaN(evaluatedForArithmetic)) {
				return this.setState(state => ({fieldHistory: [...state.fieldHistory, {text: evaluatedForArithmetic}]}))
			}

			throw Error
		} catch (err) {
			const { recognizedCommands, giveError, handleInputExecution } = this
			const cleanedInput = input.toLowerCase().trim()
			const dividedInput = cleanedInput.split(' ')
			const parsedCmd = dividedInput[0]
			const parsedParams = dividedInput.slice(1).filter(s => s[0] !== '-')
			const parsedFlags = dividedInput.slice(1).filter(s => s[0] === '-')
			const isError = !recognizedCommands.some(s => s.command === parsedCmd)

			if (isError) {
				return this.setState(state => ({fieldHistory: [...state.fieldHistory, giveError('nr', input)]}))
			}

			return handleInputExecution(parsedCmd, parsedParams, parsedFlags)
		}
	}
	handleInputExecution(cmd, params = [], flags = []) {
		if (cmd === 'help') {
			if (params.length) {
				if (params.length > 1) {
					return this.setState(state => ({
						fieldHistory: [...state.fieldHistory, this.giveError('bp', {cmd: 'HELP', noAccepted: 1})]
					}))
				}
				
				const cmdsWithHelp = this.recognizedCommands.filter(s => s.help)
				
				if (cmdsWithHelp.filter(s => s.command === params[0]).length) {
					return this.setState(state => ({
						fieldHistory: [...state.fieldHistory, {
							text: cmdsWithHelp.filter(s => s.command === params[0])[0].help,
							hasBuffer: true
						}]
					}))
				} else if (this.recognizedCommands.filter(s => s.command === params[0]).length) {
					return this.setState(state => ({
						fieldHistory: [...state.fieldHistory, {
							text: [
								`No additional help needed for ${this.recognizedCommands.filter(s => s.command === params[0])[0].command.toUpperCase()}`,
								this.recognizedCommands.filter(s => s.command === params[0])[0].purpose
							],
							hasBuffer: true
						}]
					}))
				}
				
				return this.setState(state => ({
					fieldHistory: [...state.fieldHistory, this.giveError('up', params[0].toUpperCase())]
				}))
			}
			
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {
					text: [
						'Main commands:',
						...this.recognizedCommands
							.sort((a, b) => a.command.localeCompare(b.command))
							.filter(({ isMain }) => isMain)
							.map(({ command, purpose }) => `${command.toUpperCase()}${Array.from({length: 15 - command.length}, x => '.').join('')}${purpose}`),
						'',
						'All commands:',
						...this.recognizedCommands
							.sort((a, b) => a.command.localeCompare(b.command))
							.map(({ command, purpose }) => `${command.toUpperCase()}${Array.from({length: 15 - command.length}, x => '.').join('')}${purpose}`),
						'',
						'For help about a specific command, type HELP <CMD>, e.g. HELP PROJECT.'
					],
					hasBuffer: true
				}]
			}))
		} else if (cmd === 'cls') {
			return this.setState({fieldHistory: []})
		} else if (cmd === 'start') {
			if (params.length === 1) {
				return this.setState(state => ({
					fieldHistory: [...state.fieldHistory, {text: `Launching ${params[0]}`, hasBuffer: true}]
				}), () => window.open(/http/i.test(params[0]) ? params[0] : `https://${params[0]}`))
			}
			
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, this.giveError('bp', {cmd: 'START', noAccepted: 1})]
			}))
		} else if (cmd === 'date') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: `The current date is: ${new Date(Date.now()).toLocaleDateString()}`, hasBuffer: true}]
			}))
		} else if (cmd === 'cmd') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: 'Launching new instance of my portfolio terminal...', hasBuffer: true}]
			}), () => window.open(''))
		} else if (cmd === 'theme') {
			const { setTheme } = this.props
			
			if (flags.length === 1 && (['-d', '-dark', '-l', '-light'].some(s => s === flags[0]))) {
				const themeToSet = flags[0] === '-d' || flags[0] === '-dark' ? 'dark' : 'light'
				
				return this.setState(state => ({
					fieldHistory: [...state.fieldHistory, {text: `Set the theme to ${themeToSet.toUpperCase()} mode`, hasBuffer: true}]
				}), () => setTheme(themeToSet))
			}
			
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, this.giveError(!flags.length ? 'nf' : 'bf', 'THEME')]
			}))
		} else if (cmd === 'exit') {
			return window.location.href = 'http://suhasholla.tech'
		} else if (cmd === 'time') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: `The current time is: ${new Date(Date.now()).toLocaleTimeString()}`, hasBuffer: true}]
			}))
		} else if (cmd === 'about') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: [
					'Hey there!',
					`My name is Suhas Holla. I'm a software developer based around Dallas,TX, specializing in Software Engineering and Database Systems at the University of Texas. I love programming and developing interesting things for both regular folks and developers alike!`,
					`Type CONTACT if you'd like to get in touch - otherwise I hope you enjoy visting my portfolio!`
				], hasBuffer: true}]
			}))
		} else if (cmd === 'experience') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: [
          'Internship Experience:',
					'1. VAC Teleinfra Solutions, IN',
					'SDE Intern',
					'March 2020 - December 2020',
          '',
          '2. PeopleClick Techno Solutions, IN',
					'Data Science Intern',
					'March 2019 - August 2019',
          '',
          'Research Work:',
					'Electronic Health Record Sharing System using Blockchain',
					'Published in the IJRESM December volume,2019',
					'July 2019 - December 2019',
          '',
					'Certificates:',
					'Machine Learning...............................HarvardX',
					'Front-end Development.................freeCodeCamp',
					'JS Algorithms and Data Structures.....freeCodeCamp',
					'Front-end Libraries...................freeCodeCamp',
					'Responsive Web Design.................freeCodeCamp',
					'',
					
				], hasBuffer: true}]
			}))
		}  else if (cmd === 'education') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: [
          '',
					'University of Texas, Arlington',
					'Masters in Computer Science',
					'August 2021 - Present',
          '',
          'JSS Academy of Technical Education, INDIA',
					'Bachelors of Computer Science and Engineering',
					'August 2015 - June 2019',
          '',
					
				], hasBuffer: true}]
			}))
		} else if (cmd === 'skills') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: [
					'Languages:',
					'HTML',
					'CSS',
					'JavaScript',
          'Python',
          'Java',
          'Dart',
          'C',
          'Ruby on Rails',
					'',
					'Libraries/Frameworks:',
					'Node',
					'Express',
					'React',
          'Electron',
          'Django',
          'Flask',
					'Next',
					'Redux',
					'jQuery',
					'',
          'Mobile Application Development:',
          'React Native',
          'Flutter',
          'Android',
          'Java',
          'Ionic 5',
          '',
					'Other:',
					'Git',
					'GitHub',
					'Heroku',
					'CodePen',
					'CodeSandBox',
					'Firebase',
					'NeDB'
				], hasBuffer: true}]
			}))
		} else if (cmd === 'contact') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: [
					'Email: suhashollakc@gmail.com',
					'Website: suhasholla.tech',
					'LinkedIn:linkedin.com/in/suhashollakc',
					'GitHub: github.com/suhashollakc',
					'Instagram: @codeminter',
          'Twitter: @code_minter'
				], hasBuffer: true}]
			}))
		} else if (cmd === 'projects') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {text: [
					'To view any of these projects live or their source files, type PROJECT <TITLE>, e.g. PROJECT netflix-ui.',
					'',
					'Netflix-UI',
					'Built with Flutter',
					// `Some time ago I because increasingly addicted to minesweeper, specifically the version offered by Google. In fact, I was so addicted that I decided to build the damn thing.`,
					'',
					'Taxi Booking App',
					'Built with Flutter, Firebase',
					// 'Ever heard of TinyUrl? Ever been to their website? Atrocious. So I made my own version of it.',
					'',
					'Lyft Clone',
					'Built with React Native',
					// `I was building a MS Excel spreadsheet parser (haven't finished it, imagine my stove has 10 rows of backburners) and needed a way to generate non-opinionated XML files. There were projects out there that came close, but I decided it would be fun to build it on my own.`,
					'',
					'Covid Tracker',
					'Built with Flutter',
					// `This was a project I had to build for my final while taking Udacity's React Nanodegree certification course. It's an app that tracks posts and comments, likes, etc. Nothing too complicated, except for Redux... God I hate Redux.`,
					'',
					'VPN App',
					'Built with Android',
					// 'The classic Simon memory game. I originally built this for the freeCodeCamp legacy certification, but later came back to it because I hated how bad I was with JavaScript at the time. I also wanted to see how well I could build it during a speed-coding session. Just over an hour.',
          '',
          'URL Shortner ',
					'Built with PHP',
					// 'The classic Simon memory game. I originally built this for the freeCodeCamp legacy certification, but later came back to it because I hated how bad I was with JavaScript at the time. I also wanted to see how well I could build it during a speed-coding session. Just over an hour.',
          '',
          'MMS Desktop App',
					'Built with Electron,React,Firebase',
					// 'The classic Simon memory game. I originally built this for the freeCodeCamp legacy certification, but later came back to it because I hated how bad I was with JavaScript at the time. I also wanted to see how well I could build it during a speed-coding session. Just over an hour.',
          '',
          'Content Streaming App',
					'Built with React Native,Flutter',
					// 'The classic Simon memory game. I originally built this for the freeCodeCamp legacy certification, but later came back to it because I hated how bad I was with JavaScript at the time. I also wanted to see how well I could build it during a speed-coding session. Just over an hour.',

        ], hasBuffer: true}]
			}))
		} else if (cmd === 'project') {
			if (params.length === 1) {
				const projects = [{
					title: 'Netflix-UI',
					live: 'https://github.com/suhashollakc'
				}, {
					title: 'Taxi Booking App',
					live:'https://github.com/suhashollakc'
				}, {
					title: 'Lyft Clone',
					live: 'https://github.com/suhashollakc'
				}, {
					title: 'Covid Tracker',
					live: 'https://github.com/suhashollakc'
				}, {
					title: 'VPN App',
					live: 'https://github.com/suhashollakc'
				}, {
					title: 'URL Shortner',
					live: 'https://github.com/suhashollakc'
				},, {
					title: 'MMS Desktop App',
					live: 'https://github.com/suhashollakc'
				},, {
					title: 'Content Streaming App',
					live: 'https://github.com/suhashollakc'
				},]
				
				return this.setState(state => ({
					fieldHistory: [...state.fieldHistory, {text: `Launching ${params[0]}...`, hasBuffer: true}]
				}), () => window.open(projects.filter(s => s.title === params[0])[0].live))
			}
			
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, this.giveError('bp', {cmd: 'PROJECT', noAccepted: 1})]
			}))
		} else if (cmd === 'title') {
			return this.setState(state => ({
				fieldHistory: [...state.fieldHistory, {
					text: `Set the React Terminal title to ${params.length > 0 ? params.join(' ') : '<BLANK>'}`,
					hasBuffer: true
				}]
			}), () => this.props.setTitle(params.length > 0 ? params.join(' ') : ''))
		}
	}
	handleContextMenuPaste(e) {
		e.preventDefault()
		
		if ('clipboard' in navigator) {
			navigator.clipboard.readText().then(clipboard => this.setState(state => ({
				userInput: `${state.userInput}${clipboard}`
			})))
		}
	}
	giveError(type, extra) {
		const err = { text: '', isError: true, hasBuffer: true}
		
		if (type === 'nr') {
			err.text = `${extra} : The term or expression '${extra}' is not recognized. Check the spelling and try again. If you don't know what commands are recognized, type HELP.`
		} else if (type === 'nf') {
			err.text = `The ${extra} command requires the use of flags. If you don't know what flags can be used, type HELP ${extra}.`
		} else if (type === 'bf') {
			err.text = `The flags you provided for ${extra} are not valid. If you don't know what flags can be used, type HELP ${extra}.`
		} else if (type === 'bp') {
			err.text = `The ${extra.cmd} command requires ${extra.noAccepted} parameter(s). If you don't know what parameters to use, type HELP ${extra.cmd}.`
		} else if (type === 'up') {
			err.text = `The command ${extra} is not supported by the HELP utility.`
		}
		
		return err
	}
	render() {
		const { theme } = this.props
		const { fieldHistory, userInput } = this.state
		
		return <div
					 id="field"
					 className={theme.app.backgroundColor === '#333444' ? 'dark' : 'light'}
					 style={theme.field}
					 onKeyDown={e => this.handleTyping(e)}
					 tabIndex={0}
					 onContextMenu={e => this.handleContextMenuPaste(e)}
					 >
			{fieldHistory.map(({ text, isCommand, isError, hasBuffer }) => {
				if (Array.isArray(text)) {
					return <MultiText input={text} isError={isError} hasBuffer={hasBuffer}/>
				}
				
				return <Text input={text} isCommand={isCommand} isError={isError} hasBuffer={hasBuffer}/>
			})}
			<UserText input={userInput} theme={theme.cursor}/>
		</div>
	}
}
const Text = ({ input, isCommand, isError, hasBuffer }) => <>
	<div>
		{isCommand && <div id="query">(Codeminter) C:\Users\Guest&gt;</div>}
		<span className={!isCommand && isError ? 'error' : ''}>{input}</span>
	</div>
	{hasBuffer && <div></div>}
</>
const MultiText = ({ input, isError, hasBuffer }) => <>
	{input.map(s => <Text input={s} isError={isError}/>)}
	{hasBuffer && <div></div>}
</>
const UserText = ({ input, theme }) => <div>
	<div id="query">(Codeminter) C:\Users\Guest&gt;</div>
	<span>{input}</span>
	<div id="cursor" style={theme}></div>
</div>

ReactDOM.render(<App />, document.querySelector('#root'))