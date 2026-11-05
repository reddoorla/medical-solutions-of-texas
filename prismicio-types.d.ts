import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Item in *form replies → replies*
 */
export interface FormRepliesDocumentDataRepliesItem {
	/**
	 * form field in *form replies → replies*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Pick the form this reply answers — one row per form
	 * - **API ID Path**: form_replies.replies[].form_type
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	form_type: prismic.SelectField<"contact" | "inquiry" | "newsletter" | "rsvp" | "reserve">;
	
	/**
	 * subject field in *form replies → replies*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Subject line of the email the visitor receives
	 * - **API ID Path**: form_replies.replies[].subject
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	subject: prismic.KeyTextField;
	
	/**
	 * body field in *form replies → replies*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: What the visitor reads. Bold, italic, links and lists are sent; other formatting is not.
	 * - **API ID Path**: form_replies.replies[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Content for form replies documents
 */
interface FormRepliesDocumentData {
	/**
	 * replies field in *form replies*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: form_replies.replies[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	replies: prismic.GroupField<Simplify<FormRepliesDocumentDataRepliesItem>>;
	
	/**
	 * signature field in *form replies*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sign-off appended to every reply, whatever the form
	 * - **API ID Path**: form_replies.signature
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	signature: prismic.RichTextField;
}

/**
 * form replies document from Prismic
 *
 * - **API ID**: `form_replies`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FormRepliesDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<FormRepliesDocumentData>, "form_replies", Lang>;

/**
 * Content for Home page documents
 */
interface HomePageDocumentData {
	/**
	 * heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Your Trusted Partner
	 * - **API ID Path**: home_page.trusted_heading
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trusted_heading: prismic.KeyTextField;
	
	/**
	 * VOSB logo: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Veteran-Owned Small Business (VOSB)
	 * - **API ID Path**: home_page.vosb_logo_alt
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vosb_logo_alt: prismic.KeyTextField;
	
	/**
	 * paragraph under the definition field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our expertise, VOSB (Veteran-Owned Small Business) status, and deep network of relation…
	 * - **API ID Path**: home_page.trusted_text
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	trusted_text: prismic.KeyTextField;
	
	/**
	 * first button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: home_page.contact_button
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_button: prismic.KeyTextField;
	
	/**
	 * second button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Capabilities Statement
	 * - **API ID Path**: home_page.capabilities_button
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	capabilities_button: prismic.KeyTextField;/**
	 * video: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: background video
	 * - **API ID Path**: home_page.video_title
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_title: prismic.KeyTextField;
	
	/**
	 * heading over the video field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We'll Get You
	 * - **API ID Path**: home_page.we_get_heading
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	we_get_heading: prismic.KeyTextField;
	
	/**
	 * first rotating line (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Priority / Access
	 * - **API ID Path**: home_page.we_get_1
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_1: prismic.RichTextField;
	
	/**
	 * second rotating line (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: contract / expertise
	 * - **API ID Path**: home_page.we_get_2
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_2: prismic.RichTextField;
	
	/**
	 * third rotating line (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Direct / Results
	 * - **API ID Path**: home_page.we_get_3
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_3: prismic.RichTextField;
	
	/**
	 * subheading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: The Clinician in Mind
	 * - **API ID Path**: home_page.clinician_heading
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	clinician_heading: prismic.KeyTextField;
	
	/**
	 * paragraph field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT makes medical care possible from the war fighter all the way to the retiree and al…
	 * - **API ID Path**: home_page.clinician_text
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	clinician_text: prismic.KeyTextField;/**
	 * first timeline image: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: A timeline of the six stages of a service member's life: start date at 18, deployment o…
	 * - **API ID Path**: home_page.timeline_1_alt
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_1_alt: prismic.KeyTextField;
	
	/**
	 * second timeline image: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: A timeline of the six stages of a service member's life: start date at 18, deployment o…
	 * - **API ID Path**: home_page.timeline_2_alt
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_2_alt: prismic.KeyTextField;
	
	/**
	 * third timeline image: description for screen readers field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: A timeline of the six stages of a service member's life: start date at 18, deployment o…
	 * - **API ID Path**: home_page.timeline_3_alt
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_3_alt: prismic.KeyTextField;/**
	 * heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We Know What to Do
	 * - **API ID Path**: home_page.know_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	know_heading: prismic.KeyTextField;
	
	/**
	 * left column heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Government Contracts Are
	 * - **API ID Path**: home_page.problem_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_heading: prismic.KeyTextField;
	
	/**
	 * left column, first word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: opaque
	 * - **API ID Path**: home_page.problem_1
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_1: prismic.KeyTextField;
	
	/**
	 * left column, second word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: confusing
	 * - **API ID Path**: home_page.problem_2
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_2: prismic.KeyTextField;
	
	/**
	 * left column, third word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: inaccessible
	 * - **API ID Path**: home_page.problem_3
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_3: prismic.KeyTextField;
	
	/**
	 * right column heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What You’ll get With MSOT
	 * - **API ID Path**: home_page.answer_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_heading: prismic.KeyTextField;
	
	/**
	 * right column, first word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: transparency
	 * - **API ID Path**: home_page.answer_1
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_1: prismic.KeyTextField;
	
	/**
	 * right column, second word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: understanding
	 * - **API ID Path**: home_page.answer_2
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_2: prismic.KeyTextField;
	
	/**
	 * right column, third word field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: access
	 * - **API ID Path**: home_page.answer_3
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_3: prismic.KeyTextField;
	
	/**
	 * heading below field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’re here to help
	 * - **API ID Path**: home_page.help_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	help_heading: prismic.KeyTextField;
	
	/**
	 * line under it field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Take the headache and confusion out of dealing with government healthcare
	 * - **API ID Path**: home_page.help_text
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	help_text: prismic.KeyTextField;/**
	 * heading field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our Partner
	 * - **API ID Path**: home_page.partner_heading
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_heading: prismic.KeyTextField;
	
	/**
	 * quote, with its quotation marks field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: “MSOT made the process of getting our product into the DoD system easier than we ever t…
	 * - **API ID Path**: home_page.partner_quote
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_quote: prismic.KeyTextField;
	
	/**
	 * partner logo: the partner's name field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Revogen
	 * - **API ID Path**: home_page.partner_logo_alt
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_logo_alt: prismic.KeyTextField;/**
	 * heading, first line field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Getting started
	 * - **API ID Path**: home_page.start_heading_1
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_heading_1: prismic.KeyTextField;
	
	/**
	 * heading, second line field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: is simple with msot
	 * - **API ID Path**: home_page.start_heading_2
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_heading_2: prismic.KeyTextField;
	
	/**
	 * step 01 (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: establish / goals
	 * - **API ID Path**: home_page.step_1
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_1: prismic.RichTextField;
	
	/**
	 * step 02 (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Find Your / access points
	 * - **API ID Path**: home_page.step_2
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_2: prismic.RichTextField;
	
	/**
	 * step 03 (Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Set pricing / direct invoicing
	 * - **API ID Path**: home_page.step_3
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_3: prismic.RichTextField;
	
	/**
	 * button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Learn More
	 * - **API ID Path**: home_page.start_button
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_button: prismic.KeyTextField;/**
	 * large line over the photo field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: let’s get started
	 * - **API ID Path**: home_page.cta_line
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_line: prismic.KeyTextField;
	
	/**
	 * first button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: home_page.cta_contact_button
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_contact_button: prismic.KeyTextField;
	
	/**
	 * second button field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Learn More
	 * - **API ID Path**: home_page.cta_process_button
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_process_button: prismic.KeyTextField;
}

/**
 * Home page document from Prismic
 *
 * - **API ID**: `home_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomePageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomePageDocumentData>, "home_page", Lang>;

type PageDocumentDataSlicesSlice = RichTextSlice

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * Title field in *Page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Slice Zone field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Item in *Site settings → more contract vehicles (shown on /capabilities and in Google's structured data). A row needs both a name and a number, or it is not shown.*
 */
export interface SettingsDocumentDataMoreContractsItem {
	/**
	 * name field in *Site settings → more contract vehicles (shown on /capabilities and in Google's structured data). A row needs both a name and a number, or it is not shown.*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: e.g. GSA MAS Contract
	 * - **API ID Path**: settings.more_contracts[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * number field in *Site settings → more contract vehicles (shown on /capabilities and in Google's structured data). A row needs both a name and a number, or it is not shown.*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: e.g. 47QSWA00X0000
	 * - **API ID Path**: settings.more_contracts[].value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	value: prismic.KeyTextField;
}

/**
 * Item in *Site settings → pages about MSOT elsewhere. Empty keeps today's two (LinkedIn, GSA eLibrary); a filled list replaces both, so list every page.*
 */
export interface SettingsDocumentDataSameAsItem {
	/**
	 * page field in *Site settings → pages about MSOT elsewhere. Empty keeps today's two (LinkedIn, GSA eLibrary); a filled list replaces both, so list every page.*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: The full address, starting https://
	 * - **API ID Path**: settings.same_as[].url
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	url: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Content for Site settings documents
 */
interface SettingsDocumentData {
	/**
	 * name. Page titles and the Contact page's SEO description say "MSOT" in their own wording: to change those, ask Reddoor. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical Solutions of Texas
	 * - **API ID Path**: settings.name
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * short name. Page titles and the Contact page's SEO description keep "MSOT" in their own wording: to change those, ask Reddoor. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT
	 * - **API ID Path**: settings.short_name
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	short_name: prismic.KeyTextField;
	
	/**
	 * legal name field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: OJH Services, Inc.
	 * - **API ID Path**: settings.legal_name
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legal_name: prismic.KeyTextField;
	
	/**
	 * business type field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Veteran-Owned Small Business (VOSB)
	 * - **API ID Path**: settings.business_type
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	business_type: prismic.KeyTextField;
	
	/**
	 * tagline field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Federal med-surg contracting for the VA and DoW
	 * - **API ID Path**: settings.tagline
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tagline: prismic.KeyTextField;
	
	/**
	 * definition (Home, every page's footer, and Google's structured data) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB) that helps medical…
	 * - **API ID Path**: settings.definition
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	definition: prismic.KeyTextField;
	
	/**
	 * definition (About, first sentence) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB)… formerly the Department of Defense (DoD)…
	 * - **API ID Path**: settings.definition_about
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	definition_about: prismic.KeyTextField;
	
	/**
	 * works with (end of About’s Who we are) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical Solutions of Texas (MSOT) works with medical-surgical manufacturers and federal healthcare facilities.
	 * - **API ID Path**: settings.works_with
	 * - **Tab**: Who MSOT is
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	works_with: prismic.KeyTextField;/**
	 * street. The Contact page's SEO description also states it: edit that too. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 4903 Golden Quail, Suite 120
	 * - **API ID Path**: settings.street
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	street: prismic.KeyTextField;
	
	/**
	 * city field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: San Antonio
	 * - **API ID Path**: settings.city
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	city: prismic.KeyTextField;
	
	/**
	 * state field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: TX
	 * - **API ID Path**: settings.region
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	region: prismic.KeyTextField;
	
	/**
	 * ZIP code field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 78240
	 * - **API ID Path**: settings.postal_code
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	postal_code: prismic.KeyTextField;
	
	/**
	 * country code field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: US
	 * - **API ID Path**: settings.country
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	country: prismic.KeyTextField;
	
	/**
	 * phone, as printed. The Contact page's SEO description also states it: edit that too. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 833.307.4418
	 * - **API ID Path**: settings.phone
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	phone: prismic.KeyTextField;
	
	/**
	 * email field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: info@MedicalSolutionsofTX.com
	 * - **API ID Path**: settings.email
	 * - **Tab**: Address and contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	email: prismic.KeyTextField;/**
	 * UEI field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Z7Q8TN9HMRC4
	 * - **API ID Path**: settings.uei
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	uei: prismic.KeyTextField;
	
	/**
	 * CAGE code field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 6ZM08
	 * - **API ID Path**: settings.cage
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cage: prismic.KeyTextField;
	
	/**
	 * FSS contract number field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 36F797-25-D-0204
	 * - **API ID Path**: settings.fss
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	fss: prismic.KeyTextField;
	
	/**
	 * primary NAICS field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 423450
	 * - **API ID Path**: settings.naics
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	naics: prismic.KeyTextField;
	
	/**
	 * DLA ECAT contract number (Just in Time). To retire or rename this vehicle, ask Reddoor. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: SPE2DE-25-D-A012
	 * - **API ID Path**: settings.ecat_jit
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ecat_jit: prismic.KeyTextField;
	
	/**
	 * DLA ECAT contract number (Direct Vendor Delivery). To retire or rename this vehicle, ask Reddoor. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: SPE2DE-25-D-A011
	 * - **API ID Path**: settings.ecat_dvd
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ecat_dvd: prismic.KeyTextField;
	
	/**
	 * DAPA number (Medical/Surgical). To retire or rename this vehicle, ask Reddoor. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: SP0200-11-H-0018
	 * - **API ID Path**: settings.dapa_med
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dapa_med: prismic.KeyTextField;
	
	/**
	 * DAPA number (Equipment). To retire or rename this vehicle, ask Reddoor. field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: SP0200-11-H-0003
	 * - **API ID Path**: settings.dapa_equip
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dapa_equip: prismic.KeyTextField;
	
	/**
	 * more contract vehicles (shown on /capabilities and in Google's structured data). A row needs both a name and a number, or it is not shown. field in *Site settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.more_contracts[]
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	more_contracts: prismic.GroupField<Simplify<SettingsDocumentDataMoreContractsItem>>;
	
	/**
	 * pages about MSOT elsewhere. Empty keeps today's two (LinkedIn, GSA eLibrary); a filled list replaces both, so list every page. field in *Site settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.same_as[]
	 * - **Tab**: Registrations
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	same_as: prismic.GroupField<Simplify<SettingsDocumentDataSameAsItem>>;/**
	 * title of the page-not-found page field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Page not found | MSOT
	 * - **API ID Path**: settings.not_found_title
	 * - **Tab**: Page titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	not_found_title: prismic.KeyTextField;
	
	/**
	 * title of the error page field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Something went wrong | MSOT
	 * - **API ID Path**: settings.error_title
	 * - **Tab**: Page titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_title: prismic.KeyTextField;
	
	/**
	 * description for a page that has none field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical Solutions of Texas is a Veteran-Owned Small Business that helps medical vendors…
	 * - **API ID Path**: settings.default_description
	 * - **Tab**: Page titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	default_description: prismic.KeyTextField;
}

/**
 * Site settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

/**
 * Content for Team member documents
 */
interface TeamMemberDocumentData {
	/**
	 * name field in *Team member*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Full name, as on the site (e.g. Jon Hood)
	 * - **API ID Path**: team_member.name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * job title field in *Team member*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Title, as on the site (e.g. CEO)
	 * - **API ID Path**: team_member.job_title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	job_title: prismic.KeyTextField;
	
	/**
	 * headshot field in *Team member*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: team_member.headshot
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	headshot: prismic.ImageField<never>;
	
	/**
	 * bio field in *Team member*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: 50–90 words, third person. Say VOSB (never SDVOSB), clinicians, and VA and DoW.
	 * - **API ID Path**: team_member.bio
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	bio: prismic.RichTextField;
	
	/**
	 * LinkedIn field in *Team member*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: Optional: the person's LinkedIn profile URL
	 * - **API ID Path**: team_member.linkedin
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	linkedin: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * order field in *Team member*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: Position on the About page: 1 is first
	 * - **API ID Path**: team_member.order
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	order: prismic.NumberField;
}

/**
 * Team member document from Prismic
 *
 * - **API ID**: `team_member`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type TeamMemberDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<TeamMemberDocumentData>, "team_member", Lang>;

export type AllDocumentTypes = FormRepliesDocument | HomePageDocument | PageDocument | SettingsDocument | TeamMemberDocument;

/**
 * Primary content in *RichText → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * Content field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Lorem ipsum...
	 * - **API ID Path**: rich_text.default.primary.content
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	content: prismic.RichTextField;
}

/**
 * Default variation for RichText Slice
 *
 * - **API ID**: `default`
 * - **Description**: RichText
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *RichText*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * RichText Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: RichText
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			FormRepliesDocument,
			FormRepliesDocumentData,
			FormRepliesDocumentDataRepliesItem,
			HomePageDocument,
			HomePageDocumentData,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataMoreContractsItem,
			SettingsDocumentDataSameAsItem,
			TeamMemberDocument,
			TeamMemberDocumentData,
			AllDocumentTypes,
			RichTextSlice,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			RichTextSliceDefault
		}
	}
}