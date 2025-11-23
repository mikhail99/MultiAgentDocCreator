"""
Template configurations for document generation.

This module centralizes all template-specific logic including clarification questions,
formatting instructions, and document structure definitions.
"""

from typing import Dict, List


# Template clarification questions
TEMPLATE_CLARIFICATIONS: Dict[str, List[str]] = {
    'academic-review': [
        'What specific time period should the literature review cover?',
        'Are there particular research databases or sources you want prioritized?',
        'What level of technical depth is required?',
        'Should the review include methodological analysis?'
    ],
    'business-report': [
        'What time period should this report cover?',
        'Who is the primary audience for this report?',
        'Are there specific metrics or KPIs that must be included?',
        'What is the desired report format (executive summary, detailed analysis, etc.)?'
    ],
    'technical-doc': [
        'What programming languages or frameworks should the documentation cover?',
        'Should the documentation include code examples and tutorials?',
        'What level of technical expertise should be assumed for the readers?',
        'Are there specific API endpoints or features to focus on?'
    ],
    'research-paper': [
        'What is the target journal or conference?',
        'What methodology should be emphasized?',
        'Are there specific research questions to address?',
        'What is the expected paper length?'
    ],
    'market-analysis': [
        'What market segment should be analyzed?',
        'What geographic regions should be included?',
        'What time frame should the analysis cover?',
        'Are there specific competitors to focus on?'
    ]
}


def get_clarification_questions(template_id: str) -> List[str]:
    """
    Get clarification questions for a specific template.

    Args:
        template_id: The template identifier

    Returns:
        List of clarification questions for the template
    """
    return TEMPLATE_CLARIFICATIONS.get(template_id, [
        'What is the primary goal of this document?',
        'Who is the intended audience?',
        'Are there specific sections or topics that must be included?',
        'What is the desired length or scope?'
    ])


def get_available_templates() -> List[str]:
    """
    Get list of available template IDs.

    Returns:
        List of template identifiers
    """
    return list(TEMPLATE_CLARIFICATIONS.keys())


def get_template_display_name(template_id: str) -> str:
    """
    Get human-readable display name for a template.

    Args:
        template_id: The template identifier

    Returns:
        Human-readable template name
    """
    display_names = {
        'academic-review': 'Academic Literature Review',
        'business-report': 'Business Report',
        'technical-doc': 'Technical Documentation',
        'research-paper': 'Research Paper',
        'market-analysis': 'Market Analysis'
    }
    return display_names.get(template_id, template_id.replace('-', ' ').title())
