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
 * Item in *About page → the list, top to bottom*
 */
export interface AboutPageDocumentDataServicesItem {
	/**
	 * title field in *About page → the list, top to bottom*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. The rows replace the whole list; with none, the page keeps today's four.
	 * - **API ID Path**: about_page.services[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * answer (each paragraph is a line) field in *About page → the list, top to bottom*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Enter starts a new line, shown as typed. Left empty, the row shows its title alone.
	 * - **API ID Path**: about_page.services[].answer
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	answer: prismic.RichTextField;
}

/**
 * Content for About page documents
 */
interface AboutPageDocumentData {
	/**
	 * page heading, left word field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: About
	 * - **API ID Path**: about_page.heading_left
	 * - **Tab**: About MSOT
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading_left: prismic.KeyTextField;
	
	/**
	 * page heading, right word field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT
	 * - **API ID Path**: about_page.heading_right
	 * - **Tab**: About MSOT
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading_right: prismic.KeyTextField;/**
	 * box heading field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: what differentiates us
	 * - **API ID Path**: about_page.differentiates_heading
	 * - **Tab**: What Differentiates Us
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	differentiates_heading: prismic.KeyTextField;
	
	/**
	 * line under the definition field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We are defined by expertise and experience.
	 * - **API ID Path**: about_page.defined_text
	 * - **Tab**: What Differentiates Us
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	defined_text: prismic.KeyTextField;
	
	/**
	 * experience paragraph field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: With 20 years’ worth of experience in Air Force logistics and nearly 50 years in medical device sales on our leadership team, we know the VA and DoW healthcare landscape better than anyone. We enable med-surg suppliers to find and access opportunities that they wouldn’t have been able to tap into alone.
	 * - **API ID Path**: about_page.experience_text
	 * - **Tab**: What Differentiates Us
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	experience_text: prismic.KeyTextField;/**
	 * heading field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What We Do For You
	 * - **API ID Path**: about_page.services_heading
	 * - **Tab**: What We Do For You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	services_heading: prismic.KeyTextField;
	
	/**
	 * the list, top to bottom field in *About page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about_page.services[]
	 * - **Tab**: What We Do For You
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	services: prismic.GroupField<Simplify<AboutPageDocumentDataServicesItem>>;/**
	 * eyebrow field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Who We Are
	 * - **API ID Path**: about_page.who_eyebrow
	 * - **Tab**: Who We Are
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	who_eyebrow: prismic.KeyTextField;
	
	/**
	 * heading field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We have what you’re looking for
	 * - **API ID Path**: about_page.who_heading
	 * - **Tab**: Who We Are
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	who_heading: prismic.KeyTextField;
	
	/**
	 * first paragraph field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT was founded by a team of medical sales experts in 2022. With a career running Air Force logistics on bases in the continental United States and at forward deployment locations overseas, we have the experience to know how to work within the complex system of military contracts and procurement.
	 * - **API ID Path**: about_page.who_text_1
	 * - **Tab**: Who We Are
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	who_text_1: prismic.KeyTextField;
	
	/**
	 * second paragraph (the third, on who MSOT works with, is in Settings) field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We spent our careers grappling with the difficulties in getting and keeping VA hospitals and DoW bases equipped with med-surg supplies, from the side of a logistics officer and the side of the medical sales. And so we formed MSOT, pairing experts on both sides to build an organization uniquely suited to connect med-surg suppliers with VA and DoW contracts.
	 * - **API ID Path**: about_page.who_text_2
	 * - **Tab**: Who We Are
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	who_text_2: prismic.KeyTextField;/**
	 * heading (the cards are Team member documents) field in *About page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: The Team
	 * - **API ID Path**: about_page.team_heading
	 * - **Tab**: The Team
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	team_heading: prismic.KeyTextField;
}

/**
 * About page document from Prismic
 *
 * - **API ID**: `about_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AboutPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<AboutPageDocumentData>, "about_page", Lang>;

/**
 * Item in *Capabilities page → the figures, in order*
 */
export interface CapabilitiesPageDocumentDataNumbersItem {
	/**
	 * figure (shown bold) field in *Capabilities page → the figures, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. The rows replace the whole list; with none, the page keeps today's three.
	 * - **API ID Path**: capabilities_page.numbers[].figure
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	figure: prismic.KeyTextField;
	
	/**
	 * words after it field in *Capabilities page → the figures, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: May be left empty.
	 * - **API ID Path**: capabilities_page.numbers[].line
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	line: prismic.KeyTextField;
}

/**
 * Item in *Capabilities page → the list, in order*
 */
export interface CapabilitiesPageDocumentDataCapabilitiesItem {
	/**
	 * capability field in *Capabilities page → the list, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. The rows replace the whole list; with none, the page keeps today's six.
	 * - **API ID Path**: capabilities_page.capabilities[].item
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	item: prismic.KeyTextField;
}

/**
 * Item in *Capabilities page → the list, in order*
 */
export interface CapabilitiesPageDocumentDataDesignationsItem {
	/**
	 * scope (e.g. Federal) field in *Capabilities page → the list, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. The rows replace the whole list; with none, the page keeps today's two.
	 * - **API ID Path**: capabilities_page.designations[].scope
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	scope: prismic.KeyTextField;
	
	/**
	 * designations, shown as typed (today's separate them with ·) field in *Capabilities page → the list, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: May be left empty. To separate them as today's are, copy this: · (a space, the dot, a space)
	 * - **API ID Path**: capabilities_page.designations[].items
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	items: prismic.KeyTextField;
}

/**
 * Content for Capabilities page documents
 */
interface CapabilitiesPageDocumentData {
	/**
	 * search and browser-tab title field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Capabilities Statement | MSOT
	 * - **API ID Path**: capabilities_page.meta_title
	 * - **Tab**: SEO
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * search description field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT's capabilities, contract vehicles (ECAT, FSS, DAPA), company data and designations: connecting VA and DoW treatment facilities with med-surg suppliers.
	 * - **API ID Path**: capabilities_page.meta_description
	 * - **Tab**: SEO
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;/**
	 * line above the heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Veteran-Owned Small Business
	 * - **API ID Path**: capabilities_page.eyebrow
	 * - **Tab**: Capabilities Statement
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * page heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Capabilities Statement
	 * - **API ID Path**: capabilities_page.heading
	 * - **Tab**: Capabilities Statement
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;/**
	 * heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Mission
	 * - **API ID Path**: capabilities_page.mission_heading
	 * - **Tab**: Mission
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	mission_heading: prismic.KeyTextField;
	
	/**
	 * first paragraph field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Connecting VA and DoW treatment facilities with med-surg suppliers.
	 * - **API ID Path**: capabilities_page.mission_line
	 * - **Tab**: Mission
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	mission_line: prismic.KeyTextField;
	
	/**
	 * second paragraph field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We bridge the gap between clinical demand and government procurement to support service members and veterans. Our expertise, VOSB (Veteran-Owned Small Business) status and deep network of relationships let us offer solutions where others hit roadblocks.
	 * - **API ID Path**: capabilities_page.mission_text
	 * - **Tab**: Mission
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	mission_text: prismic.KeyTextField;/**
	 * heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: By the numbers
	 * - **API ID Path**: capabilities_page.numbers_heading
	 * - **Tab**: By the Numbers
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	numbers_heading: prismic.KeyTextField;
	
	/**
	 * the figures, in order field in *Capabilities page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: capabilities_page.numbers[]
	 * - **Tab**: By the Numbers
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	numbers: prismic.GroupField<Simplify<CapabilitiesPageDocumentDataNumbersItem>>;/**
	 * heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Core capabilities
	 * - **API ID Path**: capabilities_page.capabilities_heading
	 * - **Tab**: Core Capabilities
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	capabilities_heading: prismic.KeyTextField;
	
	/**
	 * the list, in order field in *Capabilities page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: capabilities_page.capabilities[]
	 * - **Tab**: Core Capabilities
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	capabilities: prismic.GroupField<Simplify<CapabilitiesPageDocumentDataCapabilitiesItem>>;/**
	 * heading (the contract numbers are in Settings) field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contract vehicles
	 * - **API ID Path**: capabilities_page.vehicles_heading
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vehicles_heading: prismic.KeyTextField;
	
	/**
	 * ECAT, Just in Time: name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: ECAT
	 * - **API ID Path**: capabilities_page.ecat_jit_name
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ecat_jit_name: prismic.KeyTextField;
	
	/**
	 * ECAT, Just in Time: note after the number field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Just in Time
	 * - **API ID Path**: capabilities_page.ecat_jit_note
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ecat_jit_note: prismic.KeyTextField;
	
	/**
	 * ECAT, Direct Vendor Delivery: name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: ECAT
	 * - **API ID Path**: capabilities_page.ecat_dvd_name
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ecat_dvd_name: prismic.KeyTextField;
	
	/**
	 * ECAT, Direct Vendor Delivery: note after the number field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Direct Vendor Delivery
	 * - **API ID Path**: capabilities_page.ecat_dvd_note
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	ecat_dvd_note: prismic.KeyTextField;
	
	/**
	 * FSS: name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: FSS
	 * - **API ID Path**: capabilities_page.fss_name
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	fss_name: prismic.KeyTextField;
	
	/**
	 * FSS: note after the number field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: VA Schedule 65 II A
	 * - **API ID Path**: capabilities_page.fss_note
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	fss_note: prismic.KeyTextField;
	
	/**
	 * DAPA, Medical/Surgical: name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: DAPA
	 * - **API ID Path**: capabilities_page.dapa_medical_name
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dapa_medical_name: prismic.KeyTextField;
	
	/**
	 * DAPA, Medical/Surgical: note after the number field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical/Surgical
	 * - **API ID Path**: capabilities_page.dapa_medical_note
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dapa_medical_note: prismic.KeyTextField;
	
	/**
	 * DAPA, Equipment: name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: DAPA
	 * - **API ID Path**: capabilities_page.dapa_equipment_name
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dapa_equipment_name: prismic.KeyTextField;
	
	/**
	 * DAPA, Equipment: note after the number field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Equipment
	 * - **API ID Path**: capabilities_page.dapa_equipment_note
	 * - **Tab**: Contract Vehicles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dapa_equipment_note: prismic.KeyTextField;/**
	 * heading (the names and numbers are in Settings) field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Company data
	 * - **API ID Path**: capabilities_page.company_heading
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	company_heading: prismic.KeyTextField;
	
	/**
	 * label: legal name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Legal name
	 * - **API ID Path**: capabilities_page.legal_name_label
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	legal_name_label: prismic.KeyTextField;
	
	/**
	 * word between the legal name and the name field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: DBA
	 * - **API ID Path**: capabilities_page.dba
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dba: prismic.KeyTextField;
	
	/**
	 * label: UEI field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: UEI
	 * - **API ID Path**: capabilities_page.uei_label
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	uei_label: prismic.KeyTextField;
	
	/**
	 * label: CAGE field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: CAGE
	 * - **API ID Path**: capabilities_page.cage_label
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cage_label: prismic.KeyTextField;
	
	/**
	 * label: NAICS field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: NAICS
	 * - **API ID Path**: capabilities_page.naics_label
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	naics_label: prismic.KeyTextField;
	
	/**
	 * note after the primary NAICS code (the code is in Settings) field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: (primary)
	 * - **API ID Path**: capabilities_page.naics_primary
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	naics_primary: prismic.KeyTextField;
	
	/**
	 * the other NAICS codes, after the primary field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 339112, 339113
	 * - **API ID Path**: capabilities_page.naics_secondary
	 * - **Tab**: Company Data
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	naics_secondary: prismic.KeyTextField;/**
	 * heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Designations
	 * - **API ID Path**: capabilities_page.designations_heading
	 * - **Tab**: Designations
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	designations_heading: prismic.KeyTextField;
	
	/**
	 * the list, in order field in *Capabilities page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: capabilities_page.designations[]
	 * - **Tab**: Designations
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	designations: prismic.GroupField<Simplify<CapabilitiesPageDocumentDataDesignationsItem>>;/**
	 * heading field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What makes us different
	 * - **API ID Path**: capabilities_page.different_heading
	 * - **Tab**: What Makes Us Different
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	different_heading: prismic.KeyTextField;
	
	/**
	 * paragraph field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We are defined by expertise and experience. With 20 years of Air Force logistics and nearly 50 years in medical device sales on our leadership team, we know the VA and Department of War (DoW) healthcare landscape better than anyone. We help med-surg suppliers find and access opportunities they couldn't reach alone.
	 * - **API ID Path**: capabilities_page.different_text
	 * - **Tab**: What Makes Us Different
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	different_text: prismic.KeyTextField;/**
	 * heading (the name, phone, email and address are in Settings) field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact
	 * - **API ID Path**: capabilities_page.contact_heading
	 * - **Tab**: Contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_heading: prismic.KeyTextField;
	
	/**
	 * the website's address, as printed field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: medicalsolutionsoftx.com
	 * - **API ID Path**: capabilities_page.domain
	 * - **Tab**: Contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	domain: prismic.KeyTextField;
	
	/**
	 * link to the Contact page field in *Capabilities page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact us
	 * - **API ID Path**: capabilities_page.contact_link
	 * - **Tab**: Contact
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_link: prismic.KeyTextField;
}

/**
 * Capabilities page document from Prismic
 *
 * - **API ID**: `capabilities_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type CapabilitiesPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<CapabilitiesPageDocumentData>, "capabilities_page", Lang>;

/**
 * Item in *Contact page → interest menu: the choices, in order*
 */
export interface ContactPageDocumentDataInterestsItem {
	/**
	 * choice field in *Contact page → interest menu: the choices, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. Its words are what the message says was picked. The rows replace the whole list; with none, the menu keeps today's three.
	 * - **API ID Path**: contact_page.interests[].option
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	option: prismic.KeyTextField;
}

/**
 * Content for Contact page documents
 */
interface ContactPageDocumentData {
	/**
	 * page heading field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: CONTACT US
	 * - **API ID Path**: contact_page.heading
	 * - **Tab**: Contact Us
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;
	
	/**
	 * line above the address (the address, phone and email are in Settings) field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’d love to hear from you.
	 * - **API ID Path**: contact_page.intro
	 * - **Tab**: Contact Us
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	intro: prismic.KeyTextField;
	
	/**
	 * word before the phone number field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Phone:
	 * - **API ID Path**: contact_page.phone_label
	 * - **Tab**: Contact Us
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	phone_label: prismic.KeyTextField;/**
	 * email box: its hint, also read aloud as its label field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Email
	 * - **API ID Path**: contact_page.email_label
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	email_label: prismic.KeyTextField;
	
	/**
	 * name box: its hint, also read aloud as its label field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Your Name / Company
	 * - **API ID Path**: contact_page.name_label
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name_label: prismic.KeyTextField;
	
	/**
	 * interest menu: its label, read aloud only field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Interest
	 * - **API ID Path**: contact_page.interest_label
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	interest_label: prismic.KeyTextField;
	
	/**
	 * interest menu: what it shows before a choice (an untouched form still reports “Select Interest”) field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Select Interest
	 * - **API ID Path**: contact_page.interest_placeholder
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	interest_placeholder: prismic.KeyTextField;
	
	/**
	 * interest menu: the choices, in order field in *Contact page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: contact_page.interests[]
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	interests: prismic.GroupField<Simplify<ContactPageDocumentDataInterestsItem>>;
	
	/**
	 * message box: its hint, also read aloud as its label field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Your Message
	 * - **API ID Path**: contact_page.message_label
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	message_label: prismic.KeyTextField;
	
	/**
	 * send button field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Submit
	 * - **API ID Path**: contact_page.submit_button
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	submit_button: prismic.KeyTextField;
	
	/**
	 * send button while sending field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Sending…
	 * - **API ID Path**: contact_page.sending_button
	 * - **Tab**: The Form
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	sending_button: prismic.KeyTextField;/**
	 * first line, once the message is sent field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Thank you — your message has been sent.
	 * - **API ID Path**: contact_page.success_heading
	 * - **Tab**: After Sending
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	success_heading: prismic.KeyTextField;
	
	/**
	 * second line field in *Contact page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’ll be in touch shortly.
	 * - **API ID Path**: contact_page.success_text
	 * - **Tab**: After Sending
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	success_text: prismic.KeyTextField;
}

/**
 * Contact page document from Prismic
 *
 * - **API ID**: `contact_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ContactPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<ContactPageDocumentData>, "contact_page", Lang>;

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
	 * hero line, screens wider than 768px (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Connecting DoW + VA Hospitals with (Shift+Enter) Med-Surg Suppliers
	 * - **API ID Path**: home_page.hero_line
	 * - **Tab**: Hero
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	hero_line: prismic.RichTextField;
	
	/**
	 * hero subtitle field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We bridge the gap between clinical demand and government procurement to support America’s Armed Services and our Veterans.
	 * - **API ID Path**: home_page.hero_subtitle
	 * - **Tab**: Hero
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	hero_subtitle: prismic.KeyTextField;
	
	/**
	 * hero line, screens 768px wide or less (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Connecting (Shift+Enter) DoW + VA (Shift+Enter) Hospitals (Shift+Enter) w/ Med-Surg (Shift+Enter) Suppliers
	 * - **API ID Path**: home_page.hero_line_phone
	 * - **Tab**: Hero
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	hero_line_phone: prismic.RichTextField;/**
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
	 * first button (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: home_page.contact_button
	 * - **Tab**: Your Trusted Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_button: prismic.KeyTextField;
	
	/**
	 * second button (shown in capitals) field in *Home page*
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
	 * heading over the video (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We'll Get You
	 * - **API ID Path**: home_page.we_get_heading
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	we_get_heading: prismic.KeyTextField;
	
	/**
	 * first rotating line (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Priority (Shift+Enter) Access
	 * - **API ID Path**: home_page.we_get_1
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_1: prismic.RichTextField;
	
	/**
	 * second rotating line (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: contract (Shift+Enter) expertise
	 * - **API ID Path**: home_page.we_get_2
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_2: prismic.RichTextField;
	
	/**
	 * third rotating line (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Direct (Shift+Enter) Results
	 * - **API ID Path**: home_page.we_get_3
	 * - **Tab**: We'll Get You
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	we_get_3: prismic.RichTextField;
	
	/**
	 * subheading (shown in capitals) field in *Home page*
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
	 * timeline 1 (after The Clinician in Mind): step 02 heading (shown in capitals; step label 02 repeats it, so change both) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Deployment overseas
	 * - **API ID Path**: home_page.timeline_1_heading
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_1_heading: prismic.KeyTextField;
	
	/**
	 * timeline 1: step 02 text field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Critical medical supplies save lives in forward deployed environments.
	 * - **API ID Path**: home_page.timeline_1_text
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_1_text: prismic.KeyTextField;
	
	/**
	 * timeline 2 (after We’re here to help): eyebrow, screens wider than 768px (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: The Clinician in Mind
	 * - **API ID Path**: home_page.timeline_2_eyebrow
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_2_eyebrow: prismic.KeyTextField;
	
	/**
	 * timeline 2: step 03 heading (shown in capitals; step label 03 repeats it, so change both) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Raising a family
	 * - **API ID Path**: home_page.timeline_2_heading
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_2_heading: prismic.KeyTextField;
	
	/**
	 * timeline 2: step 03 text field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical care and procedures for service men, women and family members.
	 * - **API ID Path**: home_page.timeline_2_text
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_2_text: prismic.KeyTextField;
	
	/**
	 * timeline 3 (after Getting started): eyebrow, screens wider than 768px (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: The Clinician in Mind
	 * - **API ID Path**: home_page.timeline_3_eyebrow
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_3_eyebrow: prismic.KeyTextField;
	
	/**
	 * timeline 3: step 06 heading (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Veteran & retiree
	 * - **API ID Path**: home_page.timeline_3_heading
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_3_heading: prismic.KeyTextField;
	
	/**
	 * timeline 3: step 06 text field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Caring for our veterans after retirement
	 * - **API ID Path**: home_page.timeline_3_text
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_3_text: prismic.KeyTextField;
	
	/**
	 * step label 01, on all three timelines (shown in capitals after 01) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Start date: 18 y.o.
	 * - **API ID Path**: home_page.timeline_label_1
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_label_1: prismic.KeyTextField;
	
	/**
	 * step label 02, on all three timelines (shown in capitals after 02; timeline 1's heading repeats it, so change both) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Deployment overseas
	 * - **API ID Path**: home_page.timeline_label_2
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_label_2: prismic.KeyTextField;
	
	/**
	 * step label 03, on all three timelines (shown in capitals after 03; timeline 2's heading repeats it, so change both) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Raising a family
	 * - **API ID Path**: home_page.timeline_label_3
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_label_3: prismic.KeyTextField;
	
	/**
	 * step label 04, on all three timelines (shown in capitals after 04) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Active Duty Service in the US
	 * - **API ID Path**: home_page.timeline_label_4
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_label_4: prismic.KeyTextField;
	
	/**
	 * step label 05, on all three timelines (shown in capitals after 05) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Surgical procedure
	 * - **API ID Path**: home_page.timeline_label_5
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_label_5: prismic.KeyTextField;
	
	/**
	 * step label 06, on all three timelines (shown in capitals after 06) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: 85 y.o. veteran & retiree
	 * - **API ID Path**: home_page.timeline_label_6
	 * - **Tab**: Timelines
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_label_6: prismic.KeyTextField;/**
	 * heading (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We Know What to Do
	 * - **API ID Path**: home_page.know_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	know_heading: prismic.KeyTextField;
	
	/**
	 * left column heading (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Government Contracts Are
	 * - **API ID Path**: home_page.problem_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_heading: prismic.KeyTextField;
	
	/**
	 * left column, first word (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: opaque
	 * - **API ID Path**: home_page.problem_1
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_1: prismic.KeyTextField;
	
	/**
	 * left column, second word (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: confusing
	 * - **API ID Path**: home_page.problem_2
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_2: prismic.KeyTextField;
	
	/**
	 * left column, third word (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: inaccessible
	 * - **API ID Path**: home_page.problem_3
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	problem_3: prismic.KeyTextField;
	
	/**
	 * right column heading (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What You’ll get With MSOT
	 * - **API ID Path**: home_page.answer_heading
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_heading: prismic.KeyTextField;
	
	/**
	 * right column, first word (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: transparency
	 * - **API ID Path**: home_page.answer_1
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_1: prismic.KeyTextField;
	
	/**
	 * right column, second word (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: understanding
	 * - **API ID Path**: home_page.answer_2
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_2: prismic.KeyTextField;
	
	/**
	 * right column, third word (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: access
	 * - **API ID Path**: home_page.answer_3
	 * - **Tab**: We Know What to Do
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	answer_3: prismic.KeyTextField;
	
	/**
	 * heading below (shown in capitals) field in *Home page*
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
	 * heading (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our Partner
	 * - **API ID Path**: home_page.partner_heading
	 * - **Tab**: Our Partner
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partner_heading: prismic.KeyTextField;/**
	 * heading, first line (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Getting started
	 * - **API ID Path**: home_page.start_heading_1
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_heading_1: prismic.KeyTextField;
	
	/**
	 * heading, second line (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: is simple with msot
	 * - **API ID Path**: home_page.start_heading_2
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_heading_2: prismic.KeyTextField;
	
	/**
	 * step 01 (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: establish (Shift+Enter) goals
	 * - **API ID Path**: home_page.step_1
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_1: prismic.RichTextField;
	
	/**
	 * step 02 (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Find Your (Shift+Enter) access points
	 * - **API ID Path**: home_page.step_2
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_2: prismic.RichTextField;
	
	/**
	 * step 03 (shown in capitals; Shift+Enter breaks the line) field in *Home page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep: Set pricing (Shift+Enter) direct invoicing
	 * - **API ID Path**: home_page.step_3
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	step_3: prismic.RichTextField;
	
	/**
	 * button (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Learn More
	 * - **API ID Path**: home_page.start_button
	 * - **Tab**: Getting Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	start_button: prismic.KeyTextField;/**
	 * large line over the photo (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: let’s get started
	 * - **API ID Path**: home_page.cta_line
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_line: prismic.KeyTextField;
	
	/**
	 * first button (shown in capitals) field in *Home page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: home_page.cta_contact_button
	 * - **Tab**: Let's Get Started
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_contact_button: prismic.KeyTextField;
	
	/**
	 * second button (shown in capitals) field in *Home page*
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
 * Item in *Partners page → the logos, in order*
 */
export interface PartnersPageDocumentDataClientsItem {
	/**
	 * company name, read aloud for the logo field in *Partners page → the logos, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the logo's alt text; a row with neither, or with no logo, is not shown. The rows replace the whole list; with none, the page keeps today's 18.
	 * - **API ID Path**: partners_page.clients[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * logo (transparent PNG or SVG, grey duotone like the others) field in *Partners page → the logos, in order*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: partners_page.clients[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
}

/**
 * Content for Partners page documents
 */
interface PartnersPageDocumentData {
	/**
	 * page heading, left word field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our
	 * - **API ID Path**: partners_page.heading_left
	 * - **Tab**: Our Partners
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading_left: prismic.KeyTextField;
	
	/**
	 * page heading, right word field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Partners
	 * - **API ID Path**: partners_page.heading_right
	 * - **Tab**: Our Partners
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading_right: prismic.KeyTextField;/**
	 * box heading field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: working with the best
	 * - **API ID Path**: partners_page.testimonial_heading
	 * - **Tab**: Working With the Best
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	testimonial_heading: prismic.KeyTextField;
	
	/**
	 * the quoted company's logo, white on transparent (PNG or SVG): Partners shows it white, Home as uploaded on its beige band; used only with a name or alt text field in *Partners page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: partners_page.testimonial_logo
	 * - **Tab**: Working With the Best
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	testimonial_logo: prismic.ImageField<never>;
	
	/**
	 * the quoted company's name, read aloud for the logo field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed with a new logo, unless the logo has alt text. Left empty with no new logo, it keeps: Revogen
	 * - **API ID Path**: partners_page.testimonial_name
	 * - **Tab**: Working With the Best
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	testimonial_name: prismic.KeyTextField;
	
	/**
	 * the quote, without quotation marks (Home adds them) field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT made the process of getting our product into the DoD system easier than we ever thought possible. They're an invaluable partnership and wealth of knowledge when it comes to selling to the DoD and VA hospital systems.
	 * - **API ID Path**: partners_page.testimonial_text
	 * - **Tab**: Working With the Best
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	testimonial_text: prismic.KeyTextField;/**
	 * heading field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Successful Partnerships
	 * - **API ID Path**: partners_page.partnerships_heading
	 * - **Tab**: Successful Partnerships
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partnerships_heading: prismic.KeyTextField;
	
	/**
	 * paragraph field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our most successful partnerships are with companies who are looking to expand their product offering into VA and DoW facilities, who have the flexibility and mindset to work with the government and who believe it's meaningful to be a part of offering the best healthcare possible to our active duty and veteran population in the United States.
	 * - **API ID Path**: partners_page.partnerships_text
	 * - **Tab**: Successful Partnerships
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	partnerships_text: prismic.KeyTextField;/**
	 * heading field in *Partners page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our Clients
	 * - **API ID Path**: partners_page.clients_heading
	 * - **Tab**: Our Clients
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	clients_heading: prismic.KeyTextField;
	
	/**
	 * the logos, in order field in *Partners page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: partners_page.clients[]
	 * - **Tab**: Our Clients
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	clients: prismic.GroupField<Simplify<PartnersPageDocumentDataClientsItem>>;
}

/**
 * Partners page document from Prismic
 *
 * - **API ID**: `partners_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PartnersPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<PartnersPageDocumentData>, "partners_page", Lang>;

/**
 * Content for Privacy page documents
 */
interface PrivacyPageDocumentData {
	/**
	 * search and browser-tab title field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Privacy Policy | MSOT
	 * - **API ID Path**: privacy_page.meta_title
	 * - **Tab**: SEO
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * search description field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What information the Medical Solutions of Texas website collects, why, who else receives it, and the choices you have.
	 * - **API ID Path**: privacy_page.meta_description
	 * - **Tab**: SEO
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;/**
	 * page heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Privacy Policy
	 * - **API ID Path**: privacy_page.heading
	 * - **Tab**: Privacy Policy
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;
	
	/**
	 * word before the date field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Effective
	 * - **API ID Path**: privacy_page.effective_label
	 * - **Tab**: Privacy Policy
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	effective_label: prismic.KeyTextField;
	
	/**
	 * effective date field in *Privacy page*
	 *
	 * - **Field Type**: Date
	 * - **Placeholder**: Leave empty to keep November 4, 2026
	 * - **API ID Path**: privacy_page.effective_date
	 * - **Tab**: Privacy Policy
	 * - **Documentation**: https://prismic.io/docs/fields/date
	 */
	effective_date: prismic.DateField;
	
	/**
	 * opening text, under the date (paragraphs, bulleted lists, bold, italic and links) field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text: {legal name}, doing business as {name} ("we") runs this website. This policy explains what information the site collects, why, who else receives it, and the choices you have. Filled, it replaces it, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.opening_body
	 * - **Tab**: Privacy Policy
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	opening_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What we collect
	 * - **API ID Path**: privacy_page.collect_heading
	 * - **Tab**: What we collect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	collect_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links). Once filled, the services the site runs are not added automatically field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text, which the site's code writes from the services it runs. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.collect_body
	 * - **Tab**: What we collect
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	collect_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: How we use it
	 * - **API ID Path**: privacy_page.use_heading
	 * - **Tab**: How we use it
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	use_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links). Once filled, the services the site runs are not added automatically field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text, which the site's code writes from the services it runs. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.use_body
	 * - **Tab**: How we use it
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	use_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Who else receives it
	 * - **API ID Path**: privacy_page.others_heading
	 * - **Tab**: Who else receives it
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	others_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links). Once filled, the services the site runs are not added automatically field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text, which the site's code writes from the services it runs. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.others_body
	 * - **Tab**: Who else receives it
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	others_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Do Not Track
	 * - **API ID Path**: privacy_page.dnt_heading
	 * - **Tab**: Do Not Track
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	dnt_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links) field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text: Your browser may let you send a "Do Not Track" signal. There is no agreed standard for how a website should respond to it, so this site does not change what it collects when it receives one. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.dnt_body
	 * - **Tab**: Do Not Track
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	dnt_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Children
	 * - **API ID Path**: privacy_page.children_heading
	 * - **Tab**: Children
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	children_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links) field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text: This site is not meant for children under 13, and we do not knowingly collect their information. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.children_body
	 * - **Tab**: Children
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	children_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Your choices
	 * - **API ID Path**: privacy_page.choices_heading
	 * - **Tab**: Your choices
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	choices_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links) field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text: To ask what information we hold about you, or to ask us to correct or delete it, email {email}. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.choices_body
	 * - **Tab**: Your choices
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	choices_body: prismic.RichTextField;/**
	 * heading field in *Privacy page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Changes to this policy
	 * - **API ID Path**: privacy_page.changes_heading
	 * - **Tab**: Changes to this policy
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	changes_heading: prismic.KeyTextField;
	
	/**
	 * text under the heading (paragraphs, bulleted lists, bold, italic and links) field in *Privacy page*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Leave empty to keep today's text: If we change this policy, we will post the new version on this page and update the effective date above. Filled, it replaces the text under the heading, shown as typed: {legal name}, {name} and {email} show the Settings values, and {email} is a link.
	 * - **API ID Path**: privacy_page.changes_body
	 * - **Tab**: Changes to this policy
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	changes_body: prismic.RichTextField;
}

/**
 * Privacy page document from Prismic
 *
 * - **API ID**: `privacy_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PrivacyPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<PrivacyPageDocumentData>, "privacy_page", Lang>;

/**
 * Item in *Process page → the steps, in order*
 */
export interface ProcessPageDocumentDataTimelineItem {
	/**
	 * timing (e.g. Week 1) field in *Process page → the steps, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: May be left empty.
	 * - **API ID Path**: process_page.timeline[].timing
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timing: prismic.KeyTextField;
	
	/**
	 * title field in *Process page → the steps, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. Numbered 01, 02, … as they stand; the rows replace the whole timeline, and with none the page keeps today's five.
	 * - **API ID Path**: process_page.timeline[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * text field in *Process page → the steps, in order*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: May be left empty.
	 * - **API ID Path**: process_page.timeline[].text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text: prismic.KeyTextField;
}

/**
 * Item in *Process page → the questions, top to bottom*
 */
export interface ProcessPageDocumentDataFaqItem {
	/**
	 * question field in *Process page → the questions, top to bottom*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, or the row is not shown. The rows replace the whole list; with none, the page keeps today's two.
	 * - **API ID Path**: process_page.faq[].question
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question: prismic.KeyTextField;
	
	/**
	 * answer (each paragraph is a line) field in *Process page → the questions, top to bottom*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Enter starts a new line, shown as typed. Left empty, the row shows its title alone.
	 * - **API ID Path**: process_page.faq[].answer
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	answer: prismic.RichTextField;
}

/**
 * Content for Process page documents
 */
interface ProcessPageDocumentData {
	/**
	 * page heading, left word field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Our
	 * - **API ID Path**: process_page.heading_left
	 * - **Tab**: Our Process
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading_left: prismic.KeyTextField;
	
	/**
	 * page heading, right word field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Process
	 * - **API ID Path**: process_page.heading_right
	 * - **Tab**: Our Process
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading_right: prismic.KeyTextField;/**
	 * box heading field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Simplifying Complexity
	 * - **API ID Path**: process_page.simplifying_heading
	 * - **Tab**: Simplifying Complexity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	simplifying_heading: prismic.KeyTextField;
	
	/**
	 * line in the box field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Government Contracting is Complex...
	 * - **API ID Path**: process_page.complex_line
	 * - **Tab**: Simplifying Complexity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	complex_line: prismic.KeyTextField;
	
	/**
	 * paragraph in the box field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: …and often feels like continuously slamming your head into a wall. We know, we’ve been there. You find your access is expired. Late payments, inability to collect a PO, supply chain delays or mismanagement. You’re always “almost there” to get that next contract, but never quite get across the finish line. This isn’t the way things should be.
	 * - **API ID Path**: process_page.complex_text
	 * - **Tab**: Simplifying Complexity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	complex_text: prismic.KeyTextField;
	
	/**
	 * line under the box field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Let’s Simplify It…
	 * - **API ID Path**: process_page.simplify_line
	 * - **Tab**: Simplifying Complexity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	simplify_line: prismic.KeyTextField;
	
	/**
	 * paragraph under the box field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: ...and make things work. We’ve done this for years, with many partners and many situations and will help get you where you need to be. With experience comes procedure, with procedure comes consistency, efficiency, and results.
	 * - **API ID Path**: process_page.simplify_text
	 * - **Tab**: Simplifying Complexity
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	simplify_text: prismic.KeyTextField;/**
	 * background video's title (read by screen readers) field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: background video
	 * - **API ID Path**: process_page.video_title
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_title: prismic.KeyTextField;
	
	/**
	 * heading on the video field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: OUR PROCESS
	 * - **API ID Path**: process_page.video_heading
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_heading: prismic.KeyTextField;
	
	/**
	 * step 01 title field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Refine
	 * - **API ID Path**: process_page.step_1_title
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	step_1_title: prismic.KeyTextField;
	
	/**
	 * step 01 text field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’ll isolate the best contracts and options for your company
	 * - **API ID Path**: process_page.step_1_text
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	step_1_text: prismic.KeyTextField;
	
	/**
	 * step 02 title field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Guide
	 * - **API ID Path**: process_page.step_2_title
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	step_2_title: prismic.KeyTextField;
	
	/**
	 * step 02 text field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’ll guide you through the bureaucracy and paperwork, and get your application in
	 * - **API ID Path**: process_page.step_2_text
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	step_2_text: prismic.KeyTextField;
	
	/**
	 * step 03 title field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Connect
	 * - **API ID Path**: process_page.step_3_title
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	step_3_title: prismic.KeyTextField;
	
	/**
	 * step 03 text field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: We’ll get you in the room with the right people to help you build further relationships
	 * - **API ID Path**: process_page.step_3_text
	 * - **Tab**: Refine, Guide, Connect
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	step_3_text: prismic.KeyTextField;/**
	 * heading field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: What does a typical timeline look like?
	 * - **API ID Path**: process_page.timeline_heading
	 * - **Tab**: Timeline
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	timeline_heading: prismic.KeyTextField;
	
	/**
	 * the steps, in order field in *Process page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: process_page.timeline[]
	 * - **Tab**: Timeline
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	timeline: prismic.GroupField<Simplify<ProcessPageDocumentDataTimelineItem>>;/**
	 * heading field in *Process page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Common Questions & Our Answers
	 * - **API ID Path**: process_page.faq_heading
	 * - **Tab**: Common Questions
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	faq_heading: prismic.KeyTextField;
	
	/**
	 * the questions, top to bottom field in *Process page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: process_page.faq[]
	 * - **Tab**: Common Questions
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	faq: prismic.GroupField<Simplify<ProcessPageDocumentDataFaqItem>>;
}

/**
 * Process page document from Prismic
 *
 * - **API ID**: `process_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ProcessPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<ProcessPageDocumentData>, "process_page", Lang>;

/**
 * Item in *Resources page → the catalogs, in order. Any row here replaces today's two: add them back with their PDFs to keep them, typing the FSS contract number into its title*
 */
export interface ResourcesPageDocumentDataCatalogsItem {
	/**
	 * title field in *Resources page → the catalogs, in order. Any row here replaces today's two: add them back with their PDFs to keep them, typing the FSS contract number into its title*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, with a file
	 * - **API ID Path**: resources_page.catalogs[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * file (opens in a new tab) field in *Resources page → the catalogs, in order. Any row here replaces today's two: add them back with their PDFs to keep them, typing the FSS contract number into its title*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resources_page.catalogs[].file
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	file: prismic.LinkToMediaField<prismic.FieldState, never>;
}

/**
 * Item in *Resources page → the list, in order. Any row here replaces today's one*
 */
export interface ResourcesPageDocumentDataSuppliersItem {
	/**
	 * title field in *Resources page → the list, in order. Any row here replaces today's one*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, with a file
	 * - **API ID Path**: resources_page.suppliers[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * file (needed for the row to show; not clickable while this column is greyed out) field in *Resources page → the list, in order. Any row here replaces today's one*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resources_page.suppliers[].file
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	file: prismic.LinkToMediaField<prismic.FieldState, never>;
}

/**
 * Item in *Resources page → the list, in order. Any row here replaces today's one*
 */
export interface ResourcesPageDocumentDataGuidesItem {
	/**
	 * title field in *Resources page → the list, in order. Any row here replaces today's one*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Needed, with a file
	 * - **API ID Path**: resources_page.guides[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * file (needed for the row to show; not clickable while this column is greyed out) field in *Resources page → the list, in order. Any row here replaces today's one*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resources_page.guides[].file
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	file: prismic.LinkToMediaField<prismic.FieldState, never>;
}

/**
 * Content for Resources page documents
 */
interface ResourcesPageDocumentData {
	/**
	 * page heading field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Resources
	 * - **API ID Path**: resources_page.heading
	 * - **Tab**: Resources
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;/**
	 * heading field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: CHARGE SHEET
	 * - **API ID Path**: resources_page.charge_heading
	 * - **Tab**: Charge Sheet
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	charge_heading: prismic.KeyTextField;
	
	/**
	 * button field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: DOWNLOAD
	 * - **API ID Path**: resources_page.charge_button
	 * - **Tab**: Charge Sheet
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	charge_button: prismic.KeyTextField;
	
	/**
	 * the charge sheet (a PDF) field in *Resources page*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: Leave empty to keep today's file, MSOT_ChargeSheet.pdf
	 * - **API ID Path**: resources_page.charge_file
	 * - **Tab**: Charge Sheet
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	charge_file: prismic.LinkToMediaField<prismic.FieldState, never>;
	
	/**
	 * word before the phone number (the address and number are in Settings) field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Phone:
	 * - **API ID Path**: resources_page.phone_label
	 * - **Tab**: Charge Sheet
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	phone_label: prismic.KeyTextField;
	
	/**
	 * customer service email (shown as text, not a link) field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: customerservice@MedicalSolutionsofTX.com
	 * - **API ID Path**: resources_page.service_email
	 * - **Tab**: Charge Sheet
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	service_email: prismic.KeyTextField;
	
	/**
	 * button to the Contact page field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: resources_page.contact_button
	 * - **Tab**: Charge Sheet
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	contact_button: prismic.KeyTextField;/**
	 * heading field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: CAPABILITIES STATEMENT
	 * - **API ID Path**: resources_page.capabilities_heading
	 * - **Tab**: Capabilities Statement
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	capabilities_heading: prismic.KeyTextField;
	
	/**
	 * button to the Capabilities page field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: READ IT
	 * - **API ID Path**: resources_page.capabilities_button
	 * - **Tab**: Capabilities Statement
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	capabilities_button: prismic.KeyTextField;/**
	 * heading field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Catalogs
	 * - **API ID Path**: resources_page.catalogs_heading
	 * - **Tab**: Catalogs
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	catalogs_heading: prismic.KeyTextField;
	
	/**
	 * the catalogs, in order. Any row here replaces today's two: add them back with their PDFs to keep them, typing the FSS contract number into its title field in *Resources page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resources_page.catalogs[]
	 * - **Tab**: Catalogs
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	catalogs: prismic.GroupField<Simplify<ResourcesPageDocumentDataCatalogsItem>>;/**
	 * heading (this column is shown greyed out, not yet clickable) field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Suppliers
	 * - **API ID Path**: resources_page.suppliers_heading
	 * - **Tab**: Suppliers
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	suppliers_heading: prismic.KeyTextField;
	
	/**
	 * the list, in order. Any row here replaces today's one field in *Resources page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resources_page.suppliers[]
	 * - **Tab**: Suppliers
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	suppliers: prismic.GroupField<Simplify<ResourcesPageDocumentDataSuppliersItem>>;/**
	 * heading (this column is shown greyed out, not yet clickable) field in *Resources page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Technique Guides
	 * - **API ID Path**: resources_page.guides_heading
	 * - **Tab**: Technique Guides
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	guides_heading: prismic.KeyTextField;
	
	/**
	 * the list, in order. Any row here replaces today's one field in *Resources page*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resources_page.guides[]
	 * - **Tab**: Technique Guides
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	guides: prismic.GroupField<Simplify<ResourcesPageDocumentDataGuidesItem>>;
}

/**
 * Resources page document from Prismic
 *
 * - **API ID**: `resources_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ResourcesPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<ResourcesPageDocumentData>, "resources_page", Lang>;

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
	
	/**
	 * browser-tab title of any other Prismic page with no title; {page} is filled in from its address field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: MSOT | {page}
	 * - **API ID Path**: settings.untitled_title
	 * - **Tab**: Page titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	untitled_title: prismic.KeyTextField;
	
	/**
	 * error page: the line under 404, for every page that isn't found field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's: "Page not found", or "Not Found" for an address the site has never had
	 * - **API ID Path**: settings.not_found_text
	 * - **Tab**: Page titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	not_found_text: prismic.KeyTextField;
	
	/**
	 * error page: the link back to Home field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Back to home
	 * - **API ID Path**: settings.home_link
	 * - **Tab**: Page titles
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	home_link: prismic.KeyTextField;/**
	 * menu link to /about field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: About
	 * - **API ID Path**: settings.nav_about
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nav_about: prismic.KeyTextField;
	
	/**
	 * menu link to /partners field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Partners
	 * - **API ID Path**: settings.nav_partners
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nav_partners: prismic.KeyTextField;
	
	/**
	 * menu link to /process field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Process
	 * - **API ID Path**: settings.nav_process
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nav_process: prismic.KeyTextField;
	
	/**
	 * menu link to /resources field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Resources
	 * - **API ID Path**: settings.nav_resources
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nav_resources: prismic.KeyTextField;
	
	/**
	 * menu link to /contact field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact
	 * - **API ID Path**: settings.nav_contact
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	nav_contact: prismic.KeyTextField;
	
	/**
	 * top-left logo and loading-screen logo, text for screen readers field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: msot logo
	 * - **API ID Path**: settings.logo_alt
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	logo_alt: prismic.KeyTextField;
	
	/**
	 * phone menu button, for screen readers field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Open menu
	 * - **API ID Path**: settings.open_menu
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	open_menu: prismic.KeyTextField;
	
	/**
	 * phone menu close button, for screen readers field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Close menu
	 * - **API ID Path**: settings.close_menu
	 * - **Tab**: Menu
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	close_menu: prismic.KeyTextField;/**
	 * large line above the buttons (Home's is on the Home page document) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: let’s get started
	 * - **API ID Path**: settings.footer_cta
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_cta: prismic.KeyTextField;
	
	/**
	 * button to /contact (Home's is on the Home page document) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Contact Us
	 * - **API ID Path**: settings.footer_contact_button
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_contact_button: prismic.KeyTextField;
	
	/**
	 * button to /process (Home's is on the Home page document) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Learn More
	 * - **API ID Path**: settings.footer_process_button
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_process_button: prismic.KeyTextField;
	
	/**
	 * footer logo (links to Home), text for screen readers (every footer, Home's too) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Medical Solutions of Texas home
	 * - **API ID Path**: settings.footer_logo_alt
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_logo_alt: prismic.KeyTextField;
	
	/**
	 * VOSB logo, text for screen readers (every footer, Home's too) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Veteran-Owned Small Business (VOSB)
	 * - **API ID Path**: settings.vosb_alt
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vosb_alt: prismic.KeyTextField;
	
	/**
	 * fold-out label over the company lines (every footer, Home's too) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Company details
	 * - **API ID Path**: settings.company_details
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	company_details: prismic.KeyTextField;
	
	/**
	 * link to the privacy policy (every footer, Home's too) field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: Privacy Policy
	 * - **API ID Path**: settings.privacy_link
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	privacy_link: prismic.KeyTextField;
	
	/**
	 * footer's first line; {name} and {short name} are filled in field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: {name} ({short name})
	 * - **API ID Path**: settings.footer_name_line
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_name_line: prismic.KeyTextField;
	
	/**
	 * footer line under the definition (in Company details); {business type} and {tagline} are filled in field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: {business type} · {tagline}
	 * - **API ID Path**: settings.footer_type_line
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_type_line: prismic.KeyTextField;
	
	/**
	 * footer line of registration numbers (in Company details); {uei}, {cage} and {fss} are filled in field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: UEI {uei} · CAGE {cage} · FSS {fss}
	 * - **API ID Path**: settings.footer_ids_line
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_ids_line: prismic.KeyTextField;
	
	/**
	 * footer's last line, before the privacy link; {year}, {legal name} and {name} are filled in field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep: ©{year} {legal name} dba {name} |
	 * - **API ID Path**: settings.footer_copyright
	 * - **Tab**: Footer
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_copyright: prismic.KeyTextField;
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

export type AllDocumentTypes = AboutPageDocument | CapabilitiesPageDocument | ContactPageDocument | FormRepliesDocument | HomePageDocument | PageDocument | PartnersPageDocument | PrivacyPageDocument | ProcessPageDocument | ResourcesPageDocument | SettingsDocument | TeamMemberDocument;

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
			AboutPageDocument,
			AboutPageDocumentData,
			AboutPageDocumentDataServicesItem,
			CapabilitiesPageDocument,
			CapabilitiesPageDocumentData,
			CapabilitiesPageDocumentDataNumbersItem,
			CapabilitiesPageDocumentDataCapabilitiesItem,
			CapabilitiesPageDocumentDataDesignationsItem,
			ContactPageDocument,
			ContactPageDocumentData,
			ContactPageDocumentDataInterestsItem,
			FormRepliesDocument,
			FormRepliesDocumentData,
			FormRepliesDocumentDataRepliesItem,
			HomePageDocument,
			HomePageDocumentData,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			PartnersPageDocument,
			PartnersPageDocumentData,
			PartnersPageDocumentDataClientsItem,
			PrivacyPageDocument,
			PrivacyPageDocumentData,
			ProcessPageDocument,
			ProcessPageDocumentData,
			ProcessPageDocumentDataTimelineItem,
			ProcessPageDocumentDataFaqItem,
			ResourcesPageDocument,
			ResourcesPageDocumentData,
			ResourcesPageDocumentDataCatalogsItem,
			ResourcesPageDocumentDataSuppliersItem,
			ResourcesPageDocumentDataGuidesItem,
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