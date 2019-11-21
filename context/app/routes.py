from flask import Blueprint, render_template, abort, current_app, session

from .api.client import ApiClient
from .render import object_as_html


blueprint = Blueprint('routes', __name__, template_folder='templates')

types = {
    'donor': {'display_name': 'Donors', 'in_header': True},
    'sample': {'display_name': 'Samples', 'in_header': True},
    'dataset': {'display_name': 'Datasets', 'in_header': True},
    'file': {'display_name': 'Files', 'in_header': False}
}


def _get_client():
    return ApiClient(current_app.config['ENTITY_API_BASE'], session['nexus_token'])


@blueprint.route('/')
def index():
    return render_template('pages/index.html', types=types)


@blueprint.route('/browse/<type>')
def browse(type):
    if type not in types:
        abort(404)
    entities = _get_client().get_entities(type)
    return render_template('pages/browse.html', types=types, type=type, entities=entities)


@blueprint.route('/browse/<type>/<uuid>')
def details(type, uuid):
    if type not in types:
        abort(404)
    client = _get_client()
    entity = client.get_entity(uuid)

    details_html = object_as_html(entity)
    provenance = client.get_provenance(uuid)

    if type in {'file'}:  # TODO: As we have other specializations, add them here.
        template = f'pages/details/details_{type}.html'
    else:
        template = f'pages/details/details_base.html'
    return render_template(
        template, types=types, type=type, uuid=uuid,
        entity=entity,
        details_html=details_html,
        provenance=provenance
    )


@blueprint.route('/help')
def help():
    return render_template('pages/help.html', types=types)