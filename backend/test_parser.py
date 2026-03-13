from app.nlp.parser import parse_nl_to_workflow

wf1 = parse_nl_to_workflow("create a trello card saying 'Buy Milk' when I get an email")
print([action.type.value for action in wf1.actions])
print(wf1.actions[0].config.get('name'))

wf2 = parse_nl_to_workflow("post a new notion page called 'Meeting Notes' daily")
print([action.type.value for action in wf2.actions])
print(wf2.actions[0].config.get('title'))

wf3 = parse_nl_to_workflow("add row to google sheets 'Sales'")
print([action.type.value for action in wf3.actions])
print(wf3.actions[0].config.get('values'))

wf4 = parse_nl_to_workflow("create an airtable record for new lead")
print([action.type.value for action in wf4.actions])
print(wf4.actions[0].config.get('fields'))
